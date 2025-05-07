package almetpt.artspace.repository;

import almetpt.artspace.model.GenericModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Абстрактный репозиторий
 * Необходим для работы абстрактного сервиса
 * т.к. в обстрактном сервисе мы не можем использовать конкретный репозиторий,
 * а должны указывать параметризованный (GenericRepository)
 * @param <E> - Сущность, с которой работает репозиторий
 */
@NoRepositoryBean // не даст создать репозиторий, т.к. он абстрактный. Аналог @MappedSuperclass y GenericModel
public interface GenericRepository<E extends GenericModel> extends JpaRepository<E, Long> { 
    // Ограничиваем работу только с моделями, которые наследуются от GenericModel
}
