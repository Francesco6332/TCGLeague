import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  Save, 
  X,
  Users,
  Target
} from 'lucide-react';
import type { League, Standing, Match } from '../types';

interface ResultsManagerProps {
  event: League;
  onStandingsUpdated: (updatedEvent: League) => void;
}

interface MatchResult {
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  isDraw: boolean;
}

export function ResultsManager({ event, onStandingsUpdated }: ResultsManagerProps) {
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult>({
    player1Id: '',
    player1Name: '',
    player2Id: '',
    player2Name: '',
    player1Score: 0,
    player2Score: 0,
    winnerId: undefined,
    isDraw: false,
  });

  const calculateStandings = (matches: Match[], participants: any[]): Standing[] => {
    const standingsMap = new Map<string, Standing>();
    
    // Initialize standings for all participants
    participants.forEach(participant => {
      standingsMap.set(participant.playerId, {
        playerId: participant.playerId,
        playerName: participant.playerName,
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        matchesPlayed: 0,
        opponentWinPercentage: 0,
        gameWinPercentage: 0,
        rank: 0,
      });
    });

    // Calculate wins, losses, draws, and points
    matches.forEach(match => {
      if (!match.isCompleted) return;

      const player1Standing = standingsMap.get(match.player1Id);
      const player2Standing = standingsMap.get(match.player2Id);

      if (!player1Standing || !player2Standing) return;

      player1Standing.matchesPlayed++;
      player2Standing.matchesPlayed++;

      if (match.isDraw) {
        player1Standing.draws++;
        player2Standing.draws++;
        player1Standing.points += 1;
        player2Standing.points += 1;
      } else if (match.winnerId === match.player1Id) {
        player1Standing.wins++;
        player2Standing.losses++;
        player1Standing.points += 3;
      } else if (match.winnerId === match.player2Id) {
        player2Standing.wins++;
        player1Standing.losses++;
        player2Standing.points += 3;
      }
    });

    // Calculate win percentages and convert to array
    const standings = Array.from(standingsMap.values()).map(standing => {
      const totalMatches = standing.matchesPlayed;
      standing.gameWinPercentage = totalMatches > 0 ? standing.wins / totalMatches : 0;
      return standing;
    });

    // Sort by points (descending), then by wins (descending)
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });

    // Assign ranks
    standings.forEach((standing, index) => {
      standing.rank = index + 1;
    });

    return standings;
  };

  const handleAddMatch = async () => {
    if (!matchResult.player1Id || !matchResult.player2Id) {
      alert('Please select both players');
      return;
    }

    if (matchResult.player1Id === matchResult.player2Id) {
      alert('Please select different players');
      return;
    }

    setLoading(true);

    try {
      // Determine winner
      let winnerId: string | undefined;
      let isDraw = false;

      if (matchResult.player1Score > matchResult.player2Score) {
        winnerId = matchResult.player1Id;
      } else if (matchResult.player2Score > matchResult.player1Score) {
        winnerId = matchResult.player2Id;
      } else {
        isDraw = true;
      }

      // Create new match
      const newMatch: Match = {
        id: `match_${Date.now()}`,
        player1Id: matchResult.player1Id,
        player2Id: matchResult.player2Id,
        player1Name: matchResult.player1Name,
        player2Name: matchResult.player2Name,
        player1Score: matchResult.player1Score,
        player2Score: matchResult.player2Score,
        winnerId,
        isDraw,
        isCompleted: true,
        table: 1,
      };

      // Update matches in the first round (create if doesn't exist)
      const updatedRounds = [...event.rounds];
      if (updatedRounds.length === 0) {
        updatedRounds.push({
          roundNumber: 1,
          matches: [newMatch],
          isCompleted: false,
        });
      } else {
        updatedRounds[0].matches.push(newMatch);
      }

      // Calculate new standings
      const allMatches = updatedRounds.flatMap(round => round.matches);
      const newStandings = calculateStandings(allMatches, event.participants);

      // Update event in Firestore
      await updateDoc(doc(db, 'events', event.id), {
        rounds: updatedRounds,
        standings: newStandings,
        updatedAt: new Date(),
      });

      // Update local state
      const updatedEvent = {
        ...event,
        rounds: updatedRounds,
        standings: newStandings,
      };

      onStandingsUpdated(updatedEvent);

      // Reset form
      setMatchResult({
        player1Id: '',
        player1Name: '',
        player2Id: '',
        player2Name: '',
        player1Score: 0,
        player2Score: 0,
        winnerId: undefined,
        isDraw: false,
      });

      setShowAddMatch(false);
      console.log('✅ Match result added and standings updated');
    } catch (error) {
      console.error('❌ Error adding match result:', error);
      alert('Failed to add match result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (playerNumber: 1 | 2, playerId: string) => {
    const participant = event.participants.find(p => p.playerId === playerId);
    if (!participant) return;

    if (playerNumber === 1) {
      setMatchResult(prev => ({
        ...prev,
        player1Id: playerId,
        player1Name: participant.playerName,
      }));
    } else {
      setMatchResult(prev => ({
        ...prev,
        player2Id: playerId,
        player2Name: participant.playerName,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Results for {event.name}</h3>
          <p className="text-white/60 text-sm">Add match results to update standings</p>
        </div>
        <button
          onClick={() => setShowAddMatch(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Match Result</span>
        </button>
      </div>

      {/* Current Standings */}
      {event.standings.length > 0 && (
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>Current Standings</span>
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2 px-3 text-white/80">Rank</th>
                  <th className="text-left py-2 px-3 text-white/80">Player</th>
                  <th className="text-center py-2 px-3 text-white/80">Points</th>
                  <th className="text-center py-2 px-3 text-white/80">W-L-D</th>
                  <th className="text-center py-2 px-3 text-white/80">Matches</th>
                </tr>
              </thead>
              <tbody>
                {event.standings.map((standing) => (
                  <tr key={standing.playerId} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-2 px-3 font-bold text-white">#{standing.rank}</td>
                    <td className="py-2 px-3 text-white">{standing.playerName}</td>
                    <td className="py-2 px-3 text-center font-bold text-blue-400">{standing.points}</td>
                    <td className="py-2 px-3 text-center text-white/80">
                      {standing.wins}-{standing.losses}-{standing.draws}
                    </td>
                    <td className="py-2 px-3 text-center text-white/60">{standing.matchesPlayed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {event.rounds.length > 0 && event.rounds[0].matches.length > 0 && (
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-400" />
            <span>Recent Matches</span>
          </h4>
          
          <div className="space-y-3">
            {event.rounds[0].matches.slice(-5).map((match) => (
              <div key={match.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-medium">{match.player1Name}</span>
                    <span className="text-white/60">vs</span>
                    <span className="text-white font-medium">{match.player2Name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold">
                      {match.player1Score} - {match.player2Score}
                    </span>
                    {match.isDraw ? (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs">Draw</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                        {match.winnerId === match.player1Id ? match.player1Name : match.player2Name} wins
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Match Modal */}
      {showAddMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add Match Result</h3>
              <button
                onClick={() => setShowAddMatch(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Player 1 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Player 1</label>
                <select
                  value={matchResult.player1Id}
                  onChange={(e) => handlePlayerSelect(1, e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select Player 1</option>
                  {event.participants.map((participant) => (
                    <option key={participant.playerId} value={participant.playerId}>
                      {participant.playerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Player 2 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Player 2</label>
                <select
                  value={matchResult.player2Id}
                  onChange={(e) => handlePlayerSelect(2, e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select Player 2</option>
                  {event.participants.map((participant) => (
                    <option key={participant.playerId} value={participant.playerId}>
                      {participant.playerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {matchResult.player1Name || 'Player 1'} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={matchResult.player1Score}
                    onChange={(e) => setMatchResult(prev => ({ ...prev, player1Score: parseInt(e.target.value) || 0 }))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {matchResult.player2Name || 'Player 2'} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={matchResult.player2Score}
                    onChange={(e) => setMatchResult(prev => ({ ...prev, player2Score: parseInt(e.target.value) || 0 }))}
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddMatch(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMatch}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Result'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {event.participants.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">No Participants Yet</h4>
          <p className="text-white/60">Players need to register for this event before you can add match results.</p>
        </div>
      )}
    </div>
  );
}
