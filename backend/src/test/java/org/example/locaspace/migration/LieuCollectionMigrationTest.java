package org.example.locaspace.migration;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Exercises the H2 migration against a disposable in-memory database only.
 * The production Aiven database and the local backend/data/locaspace.mv.db are never touched.
 */
class LieuCollectionMigrationTest {

    @Test
    void h2MigrationPreservesEveryValueAndAddsPrimaryKeys() throws Exception {
        String url = "jdbc:h2:mem:migration_" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            seedLegacySchema(connection);
            ScriptUtils.executeSqlScript(connection,
                    new ClassPathResource("db/migration/h2/V2__lieu_collections_to_child_entities.sql"));

            assertThat(photoUrls(connection, 1L)).containsExactly("a.jpg", "b.jpg", "c.jpg");
            assertThat(photoUrls(connection, 2L)).containsExactly("z.jpg");
            assertThat(amenities(connection, 1L)).containsExactly("Jardin", "WiFi");
            assertThat(amenities(connection, 2L)).containsExactly("TV");

            assertThat(hasPrimaryKey(connection, "LIEU_PHOTOS")).isTrue();
            assertThat(hasPrimaryKey(connection, "LIEU_AMENITIES")).isTrue();

            // Identity generation must work after migration (app inserts omit the id).
            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate(
                        "INSERT INTO lieu_photos (lieu_id, photo_url, position) VALUES (2, 'new.jpg', 1)");
            }
            assertThat(photoUrls(connection, 2L)).containsExactly("z.jpg", "new.jpg");
        }
    }

    private void seedLegacySchema(Connection connection) throws Exception {
        try (Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE lieux (id BIGINT PRIMARY KEY)");
            statement.execute("CREATE TABLE lieu_photos (lieu_id BIGINT NOT NULL, photo_url VARCHAR(255) NOT NULL)");
            statement.execute("CREATE TABLE lieu_amenities (lieu_id BIGINT NOT NULL, amenity VARCHAR(255) NOT NULL)");
            statement.execute("INSERT INTO lieux (id) VALUES (1), (2)");
            statement.execute("INSERT INTO lieu_photos (lieu_id, photo_url) VALUES " +
                    "(1, 'b.jpg'), (1, 'a.jpg'), (1, 'c.jpg'), (2, 'z.jpg')");
            statement.execute("INSERT INTO lieu_amenities (lieu_id, amenity) VALUES " +
                    "(1, 'WiFi'), (1, 'Jardin'), (2, 'TV')");
        }
    }

    private List<String> photoUrls(Connection connection, long lieuId) throws Exception {
        return singleColumn(connection,
                "SELECT photo_url FROM lieu_photos WHERE lieu_id = " + lieuId + " ORDER BY position");
    }

    private List<String> amenities(Connection connection, long lieuId) throws Exception {
        return singleColumn(connection,
                "SELECT amenity FROM lieu_amenities WHERE lieu_id = " + lieuId + " ORDER BY position");
    }

    private List<String> singleColumn(Connection connection, String sql) throws Exception {
        List<String> values = new ArrayList<>();
        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(sql)) {
            while (resultSet.next()) {
                values.add(resultSet.getString(1));
            }
        }
        return values;
    }

    private boolean hasPrimaryKey(Connection connection, String tableName) throws Exception {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet resultSet = metaData.getPrimaryKeys(null, null, tableName)) {
            return resultSet.next();
        }
    }
}
