package room

import "testing"

func TestIsValidScale(t *testing.T) {
	valid := []string{"fibonacci", "tshirt", "powersof2", "animals"}
	for _, s := range valid {
		if !IsValidScale(s) {
			t.Errorf("expected %q to be a valid scale", s)
		}
	}

	invalid := []string{"", "FIBONACCI", "fib", "garbage", "tshirt "}
	for _, s := range invalid {
		if IsValidScale(s) {
			t.Errorf("expected %q to be an invalid scale", s)
		}
	}
}

func TestNewStoresScale(t *testing.T) {
	r := New("tshirt")
	if r.Scale != "tshirt" {
		t.Fatalf("expected room to store the scale. Got: %v", r.Scale)
	}
}
