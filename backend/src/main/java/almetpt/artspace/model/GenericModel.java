package almetpt.artspace.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class GenericModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "created_when")
    private LocalDateTime createdWhen;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @Column(name = "updated_when")
    private LocalDateTime updatedWhen;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    @Column(name = "is_deleted", columnDefinition = "boolean default false")
    private Boolean isDeleted = false;
    
    @PrePersist
    public void prePersist() {
        this.createdWhen = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedWhen = LocalDateTime.now();
    }
}
