package org.example.locaspace.seed;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies that data.sql is safe to run repeatedly: it must not create duplicates.
 * Uses the disposable in-memory H2 defined in src/test/resources/application.properties.
 */
@SpringBootTest
class DataSeedIdempotencyTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void seedDataCanBeAppliedRepeatedlyWithoutIntroducingDuplicates() throws Exception {
        long photos = count("lieu_photos");
        long amenities = count("lieu_amenities");
        long lieux = count("lieux");
        long users = count("users");
        long reservations = count("reservations");
        long reviews = count("avis");

        assertThat(lieux).isGreaterThan(0);
        assertThat(photos).isGreaterThan(0);
        assertThat(amenities).isGreaterThan(0);

        try (Connection connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("data.sql"));
        }

        assertThat(count("lieu_photos")).isEqualTo(photos);
        assertThat(count("lieu_amenities")).isEqualTo(amenities);
        assertThat(count("lieux")).isEqualTo(lieux);
        assertThat(count("users")).isEqualTo(users);
        assertThat(count("reservations")).isEqualTo(reservations);
        assertThat(count("avis")).isEqualTo(reviews);

        assertThat(count("(SELECT DISTINCT lieu_id, photo_url FROM lieu_photos)")).isEqualTo(photos);
        assertThat(count("(SELECT DISTINCT lieu_id, amenity FROM lieu_amenities)")).isEqualTo(amenities);
    }

    private long count(String table) throws Exception {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("SELECT COUNT(*) FROM " + table)) {
            resultSet.next();
            return resultSet.getLong(1);
        }
    }
}
