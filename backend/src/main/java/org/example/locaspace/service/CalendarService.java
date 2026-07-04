package org.example.locaspace.service;

import org.example.locaspace.model.CalendarEvent;
import org.example.locaspace.model.Lieu;
import org.example.locaspace.repository.CalendarEventRepository;
import org.example.locaspace.repository.LieuRepository;
import org.example.locaspace.repository.ReservationRepository;
import org.example.locaspace.model.Reservation;
import org.example.locaspace.model.enums.ReservationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class CalendarService {

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    @Autowired
    private LieuRepository lieuRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public List<CalendarEvent> getEvents(Long lieuId, LocalDate start, LocalDate end) {
        Lieu lieu = lieuRepository.findById(lieuId).orElseThrow();
        List<CalendarEvent> events = new java.util.ArrayList<>(calendarEventRepository.findInRange(lieu, start, end));

        List<Reservation> reservations = reservationRepository.findByLieu(lieu).stream()
                .filter(r -> (r.getStatut() == ReservationStatus.CONFIRMEE || r.getStatut() == ReservationStatus.EN_ATTENTE) 
                        && (r.getDateDebut().isBefore(end) && r.getDateFin().isAfter(start)))
                .toList();

        for (Reservation r : reservations) {
            events.add(CalendarEvent.builder()
                    .lieu(lieu)
                    .startDate(r.getDateDebut())
                    .endDate(r.getDateFin().minusDays(1)) // For frontend rendering compatibility
                    .type(r.getStatut() == ReservationStatus.CONFIRMEE ? "booked" : "pending")
                    .title(r.getLocataire().getNom() + " - " + r.getStatut().toString())
                    .build());
        }
        return events;
    }

    public CalendarEvent blockDates(Long lieuId, LocalDate start, LocalDate end, String title) {
        Lieu lieu = lieuRepository.findById(lieuId).orElseThrow();
        CalendarEvent event = CalendarEvent.builder()
                .lieu(lieu)
                .startDate(start)
                .endDate(end)
                .type("blocked")
                .title(title)
                .build();
        return calendarEventRepository.save(event);
    }

    public void deleteEvent(Long eventId) {
        calendarEventRepository.deleteById(eventId);
    }
}





