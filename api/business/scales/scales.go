// Package scales holds the agile estimation scales a room can be created with.
// The server owns this table: it renders the voting cards, resolves the labels
// shown on revealed board cards, and computes the verdict of a round.
package scales

// Special card values shared by every scale. Votes with these values are
// excluded from the statistics of a round.
const (
	Unknown = 100  // "?"
	Coffee  = 1000 // a break
)

// Default is the scale a room falls back to when none was requested.
const Default = "fibonacci"

// Card is a single option a voter can pick. Value is what travels over the
// wire; Label is what the user sees. Description spells the label out in words
// for cards drawn as an emoji, where the glyph alone is not a name a tooltip or
// a screen reader can use; it is empty when the label already reads as text.
type Card struct {
	Label       string `json:"label"`
	Value       int    `json:"value"`
	Description string `json:"description,omitempty"`
}

// Scale is one named set of cards. Numeric scales show an average and a
// standard deviation once a round is revealed; the others only show a verdict,
// because averaging "M" and "XL" is not meaningful.
type Scale struct {
	Name    string `json:"name"`
	Value   string `json:"value"`
	Numeric bool   `json:"numeric"`
	// Emoji marks a scale drawn entirely as emoji. Its break card shows the
	// coffee glyph rather than the cup artwork the other scales share.
	Emoji bool   `json:"emoji"`
	Cards []Card `json:"cards"`
}

// Order is the display order of the scales in the create-room form.
var Order = []string{"fibonacci", "tshirt", "powersof2", "animals"}

var scales = map[string]Scale{
	"fibonacci": {
		Name:    "Fibonacci",
		Value:   "fibonacci",
		Numeric: true,
		Cards: []Card{
			{Label: "0", Value: 0},
			{Label: "1", Value: 1},
			{Label: "2", Value: 2},
			{Label: "3", Value: 3},
			{Label: "5", Value: 5},
			{Label: "8", Value: 8},
			{Label: "13", Value: 13},
			{Label: "21", Value: 21},
			{Label: "34", Value: 34},
			{Label: "55", Value: 55},
			{Label: "89", Value: 89},
			{Label: "?", Value: Unknown},
			{Label: "☕", Value: Coffee},
		},
	},
	"tshirt": {
		Name:    "T-shirt sizes",
		Value:   "tshirt",
		Numeric: false,
		Cards: []Card{
			{Label: "XS", Value: 1},
			{Label: "S", Value: 2},
			{Label: "M", Value: 3},
			{Label: "L", Value: 5},
			{Label: "XL", Value: 8},
			{Label: "XXL", Value: 13},
			{Label: "?", Value: Unknown},
			{Label: "☕", Value: Coffee},
		},
	},
	"powersof2": {
		Name:    "Powers of 2",
		Value:   "powersof2",
		Numeric: true,
		Cards: []Card{
			{Label: "0", Value: 0},
			{Label: "1", Value: 1},
			{Label: "2", Value: 2},
			{Label: "4", Value: 4},
			{Label: "8", Value: 8},
			{Label: "16", Value: 16},
			{Label: "32", Value: 32},
			{Label: "64", Value: 64},
			{Label: "?", Value: Unknown},
			{Label: "☕", Value: Coffee},
		},
	},
	"animals": {
		Name:    "Animals",
		Value:   "animals",
		Numeric: false,
		Emoji:   true,
		// Drawn as emoji: the animal names are too long to fit a voting card,
		// so the word moves to Description and becomes the tooltip.
		Cards: []Card{
			{Label: "🐭", Value: 1, Description: "Mouse"},
			{Label: "🐱", Value: 2, Description: "Cat"},
			{Label: "🐶", Value: 3, Description: "Dog"},
			{Label: "🐑", Value: 5, Description: "Sheep"},
			{Label: "🐮", Value: 8, Description: "Cow"},
			{Label: "🐘", Value: 13, Description: "Elephant"},
			{Label: "❓", Value: Unknown, Description: "Unsure"},
			{Label: "☕", Value: Coffee, Description: "Coffee break"},
		},
	},
}

// IsValid reports whether name is a known scale identifier.
func IsValid(name string) bool {
	_, found := scales[name]
	return found
}

// Get returns the named scale, falling back to the default one so callers
// never have to deal with a zero Scale.
func Get(name string) Scale {
	if scale, found := scales[name]; found {
		return scale
	}
	return scales[Default]
}

// All returns every scale in display order.
func All() []Scale {
	all := make([]Scale, 0, len(Order))
	for _, name := range Order {
		all = append(all, scales[name])
	}
	return all
}

// Label returns the label of the card with the given value, or an empty string
// when the scale has no such card.
func (s Scale) Label(value int) string {
	for _, card := range s.Cards {
		if card.Value == value {
			return card.Label
		}
	}
	return ""
}

// ClosestLabel returns the label of the estimable card nearest to target. The
// special "?" and coffee cards are never returned — they are not estimates.
func (s Scale) ClosestLabel(target float64) string {
	closest := ""
	minDiff := 0.0
	for _, card := range s.Cards {
		if card.Value >= Unknown {
			continue
		}
		diff := target - float64(card.Value)
		if diff < 0 {
			diff = -diff
		}
		if closest == "" || diff < minDiff {
			closest = card.Label
			minDiff = diff
		}
	}
	if closest == "" {
		return "?"
	}
	return closest
}
