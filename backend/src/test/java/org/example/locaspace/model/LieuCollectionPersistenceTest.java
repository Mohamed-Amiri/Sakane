package org.example.locaspace.model;

import org.example.locaspace.repository.LieuRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import jakarta.persistence.EntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = "spring.sql.init.mode=never")
class LieuCollectionPersistenceTest {

    @Autowired
    private LieuRepository lieuRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void persistsChildrenWithParentAndLoadsThemInPositionOrder() {
        Lieu lieu = Lieu.builder().titre("Villa persist").valide(true).build();
        lieu.replacePhotos(List.of("second.jpg", "first.jpg", "third.jpg"));
        lieu.replaceAmenities(List.of("WiFi", "Piscine"));

        Lieu saved = lieuRepository.saveAndFlush(lieu);
        Long id = saved.getId();
        entityManager.clear();

        Lieu reloaded = lieuRepository.findById(id).orElseThrow();
        assertThat(reloaded.getPhotoUrls()).containsExactly("second.jpg", "first.jpg", "third.jpg");
        assertThat(reloaded.getAmenityNames()).containsExactly("WiFi", "Piscine");

        List<LieuPhoto> photos = entityManager
                .createQuery("select p from LieuPhoto p where p.lieu.id = :id order by p.position", LieuPhoto.class)
                .setParameter("id", id)
                .getResultList();
        assertThat(photos).extracting(LieuPhoto::getPosition).containsExactly(0, 1, 2);
        assertThat(photos).allSatisfy(photo -> assertThat(photo.getLieu().getId()).isEqualTo(id));
    }

    @Test
    void replacingPhotosRemovesOrphanedChildren() {
        Lieu lieu = Lieu.builder().titre("Villa orphans").valide(true).build();
        lieu.replacePhotos(List.of("a.jpg", "b.jpg", "c.jpg"));
        Lieu saved = lieuRepository.saveAndFlush(lieu);
        Long id = saved.getId();

        lieu.replacePhotos(List.of("b.jpg", "d.jpg"));
        lieuRepository.saveAndFlush(lieu);
        entityManager.clear();

        Long photoRows = entityManager
                .createQuery("select count(p) from LieuPhoto p where p.lieu.id = :id", Long.class)
                .setParameter("id", id)
                .getSingleResult();
        assertThat(photoRows).isEqualTo(2L);
        assertThat(lieuRepository.findById(id).orElseThrow().getPhotoUrls())
                .containsExactly("b.jpg", "d.jpg");
    }

    @Test
    void reorderPhotosKeepsEveryExistingValueAndRenumbersSequentially() {
        Lieu lieu = Lieu.builder().titre("Villa reorder").valide(true).build();
        lieu.replacePhotos(List.of("a.jpg", "b.jpg", "c.jpg"));

        // The client omits "b.jpg" and references an unknown URL: nothing must be lost.
        lieu.reorderPhotos(List.of("c.jpg", "unknown.jpg", "a.jpg"));

        assertThat(lieu.getPhotoUrls()).containsExactly("c.jpg", "a.jpg", "b.jpg");
        assertThat(lieu.getPhotos()).extracting(LieuPhoto::getPosition).containsExactly(0, 1, 2);
    }
}
