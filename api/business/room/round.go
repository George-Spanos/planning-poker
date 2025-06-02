// Round represents a Poker Planning round for a single Story/Task
package room

import "sync"

// A round always belongs to a room and has a certain number of votes
type Round struct {
	Votes    sync.Map // username -> int (story points)
	Revealed bool
	mu       sync.RWMutex // For the Revealed field
}

func NewRound() *Round {
	return &Round{Votes: sync.Map{}, Revealed: false}
}

func (r *Round) IsRevealable(voters int) bool {
	voteCount := 0
	r.Votes.Range(func(key, value interface{}) bool {
		voteCount++
		return true
	})
	return voters > 0 && voters == voteCount
}

// Helper method to get vote count
func (r *Round) GetVoteCount() int {
	count := 0
	r.Votes.Range(func(key, value interface{}) bool {
		count++
		return true
	})
	return count
}

// Helper method to get all votes as a map (for broadcasting)
func (r *Round) GetVotesMap() map[string]int {
	votes := make(map[string]int)
	r.Votes.Range(func(key, value interface{}) bool {
		votes[key.(string)] = value.(int)
		return true
	})
	return votes
}

// Thread-safe methods for Revealed field
func (r *Round) IsRevealed() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.Revealed
}

func (r *Round) SetRevealed(revealed bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Revealed = revealed
}
