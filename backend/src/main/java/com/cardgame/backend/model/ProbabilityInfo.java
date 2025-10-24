package com.cardgame.backend.model;

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

    public int getHigher() {
        return higher;
    }

    public void setHigher(int higher) {
        this.higher = higher;
    }

    public int getLower() {
        return lower;
    }

    public void setLower(int lower) {
        this.lower = lower;
    }

    public int getEqual() {
        return equal;
    }

    public void setEqual(int equal) {
        this.equal = equal;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}