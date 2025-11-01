package com.cardgame.backend.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProbabilityInfo {
    private int higher;
    private int lower;
    private int equal;
    private int total;

    public ProbabilityInfo() {}

    public ProbabilityInfo(int higher, int lower, int equal, int total) {
        this.higher = higher;
        this.lower = lower;
        this.equal = equal;
        this.total = total;
    }
}