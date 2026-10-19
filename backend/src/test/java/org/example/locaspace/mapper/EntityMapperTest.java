package org.example.locaspace.mapper;

import org.example.locaspace.dto.lieu.LieuRequest;
import org.example.locaspace.dto.lieu.LieuResponse;
import org.example.locaspace.dto.reservation.ReservationResponse;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.model.LieuAmenity;
import org.example.locaspace.model.LieuPhoto;
import org.example.locaspace.model.Reservation;
import org.example.locaspace.model.enums.LieuType;
import org.example.locaspace.repository.AvisRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class EntityMapperTest {

    private EntityMapper mapper;

    @BeforeEach
    void setUp() {
        AvisRepository avisRepository = mock(AvisRepository.class);
        when(avisRepository.findAverageNoteByLieu(any())).thenReturn(4.5);
        when(avisRepository.countByLieu(any())).thenReturn(2L);

        mapper = new EntityMapper();
        ReflectionTestUtils.setField(mapper, "avisRepository", avisRepository);
    }

    @Test
    void toLieuCreatesOwnedChildrenWithSequentialPositions() {
        LieuRequest request = new LieuRequest();
        request.setTitre("Villa test");
        request.setPhotos(List.of("c.jpg", "a.jpg", "b.jpg"));
        request.setAmenities(List.of("WiFi", "Piscine"));

        Lieu lieu = mapper.toLieu(request, LieuType.VILLA);

        assertThat(lieu.getPhotoUrls()).containsExactly("c.jpg", "a.jpg", "b.jpg");
        assertThat(lieu.getPhotos())
                .extracting(LieuPhoto::getPosition)
                .containsExactly(0, 1, 2);
        assertThat(lieu.getPhotos()).allSatisfy(photo -> assertThat(photo.getLieu()).isSameAs(lieu));
        assertThat(lieu.getAmenityNames()).containsExactly("WiFi", "Piscine");
        assertThat(lieu.getAmenities())
                .extracting(LieuAmenity::getPosition)
                .containsExactly(0, 1);
    }

    @Test
    void toLieuSkipsNullAndBlankValues() {
        LieuRequest request = new LieuRequest();
        request.setPhotos(java.util.Arrays.asList("a.jpg", null, " ", "b.jpg"));

        Lieu lieu = mapper.toLieu(request, LieuType.VILLA);

        assertThat(lieu.getPhotoUrls()).containsExactly("a.jpg", "b.jpg");
        assertThat(lieu.getPhotos()).extracting(LieuPhoto::getPosition).containsExactly(0, 1);
    }

    @Test
    void toLieuHandlesMissingCollections() {
        LieuRequest request = new LieuRequest();

        Lieu lieu = mapper.toLieu(request, LieuType.VILLA);

        assertThat(lieu.getPhotoUrls()).isEmpty();
        assertThat(lieu.getAmenityNames()).isEmpty();
    }

    @Test
    void lieuResponseExposesPhotosAndAmenitiesAsStringArraysInPositionOrder() {
        Lieu lieu = Lieu.builder().id(7L).titre("Loft").type(LieuType.LOFT).build();
        // Insert out of order to prove @OrderBy semantics are not relied upon for the DTO.
        LieuPhoto second = new LieuPhoto("second.jpg", 1);
        second.setLieu(lieu);
        LieuPhoto first = new LieuPhoto("first.jpg", 0);
        first.setLieu(lieu);
        lieu.setPhotos(List.of(second, first));
        lieu.replaceAmenities(List.of("WiFi", "Cuisine"));

        LieuResponse response = mapper.toLieuResponse(lieu);

        assertThat(response.getPhotos()).containsExactly("second.jpg", "first.jpg");
        assertThat(response.getAmenities()).containsExactly("WiFi", "Cuisine");
    }

    @Test
    void reservationResponseCarriesLieuPhotosAndAmenities() {
        Lieu lieu = Lieu.builder().id(3L).titre("Riad").type(LieuType.MAISON).build();
        lieu.replacePhotos(List.of("one.jpg", "two.jpg"));
        lieu.replaceAmenities(List.of("Patio", "Terrasse"));

        Reservation reservation = Reservation.builder().id(11L).lieu(lieu).build();

        ReservationResponse response = mapper.toReservationResponse(reservation);

        assertThat(response.getLieu()).isNotNull();
        assertThat(response.getLieu().getPhotos()).containsExactly("one.jpg", "two.jpg");
        assertThat(response.getLieu().getAmenities()).containsExactly("Patio", "Terrasse");
    }
}
