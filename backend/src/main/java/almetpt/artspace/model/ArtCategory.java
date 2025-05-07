package almetpt.artspace.model;

import lombok.Getter;

@Getter
public enum ArtCategory {
    PAINTING("Живопись"),
    SCULPTURE("Скульптура"),
    PHOTOGRAPHY("Фотография"),
    DIGITAL_ART("Цифровое искусство"),
    INSTALLATION("Инсталляция");

    private final String russianTitle;

    ArtCategory(String russianTitle) {
        this.russianTitle = russianTitle;
    }
}
