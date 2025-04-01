import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";

export default function TiltNation() {
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [buyIn, setBuyIn] = useState(10);
  const [recaves, setRecaves] = useState({});
  const [gains, setGains] = useState({});
  const [sessions, setSessions] = useState([]);
  const [tournamentRounds, setTournamentRounds] = useState([]);
  const [globalScores, setGlobalScores] = useState({});
  const [finalTablePlayers, setFinalTablePlayers] = useState([]);
  const [showFinalTableSelect, setShowFinalTableSelect] = useState(false);
  const [finalTableActive, setFinalTableActive] = useState(false);
  const [finalTableEliminated, setFinalTableEliminated] = useState([]);

  const addPlayer = () => {
    if (playerInput.trim() !== "") {
      const name = playerInput.trim();
      setPlayers([...players, name]);
      setActivePlayers([...activePlayers, name]);
      setPlayerInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPlayer();
    }
  };

  const eliminatePlayer = (name) => {
    setActivePlayers(activePlayers.filter((p) => p !== name));
  };

  const addRecave = (name) => {
    setRecaves({ ...recaves, [name]: (recaves[name] || 0) + 1 });
  };

  const finalizeCashGameSession = () => {
    const totalInvested = Object.fromEntries(
      activePlayers.map((p) => [p, buyIn + (recaves[p] ? recaves[p] * buyIn : 0)])
    );
    const profit = {};
    activePlayers.forEach((p) => {
      const gain = gains[p] || 0;
      profit[p] = gain - totalInvested[p];
    });
    const session = {
      date: new Date().toLocaleDateString(),
      players: activePlayers,
      buyIn,
      recaves: { ...recaves },
      gains: { ...gains },
      profit
    };
    setSessions([...sessions, session]);
    setPlayers([]);
    setActivePlayers([]);
    setRecaves({});
    setGains({});
  };

  const finalizeTournamentRound = () => {
    const round = {
      date: new Date().toLocaleDateString(),
      players: [...players],
      eliminated: [...players.filter(p => !activePlayers.includes(p))],
      remaining: [...activePlayers]
    };
    const ranking = [...round.eliminated, ...round.remaining.reverse()];
    setTournamentRounds([...tournamentRounds, { ...round, ranking }]);

    const updatedScores = { ...globalScores };
    ranking.forEach((p, i) => {
      updatedScores[p] = (updatedScores[p] || 0) + (players.length - i);
    });
    setGlobalScores(updatedScores);

    setPlayers([]);
    setActivePlayers([]);
  };

  const toggleFinalTable = () => {
    setShowFinalTableSelect(!showFinalTableSelect);
    if (!showFinalTableSelect) {
      setFinalTablePlayers(Object.keys(globalScores));
    }
  };

  const handleToggleFinalPlayer = (name) => {
    if (finalTablePlayers.includes(name)) {
      setFinalTablePlayers(finalTablePlayers.filter((n) => n !== name));
    } else {
      setFinalTablePlayers([...finalTablePlayers, name]);
    }
  };

  const launchFinalTable = () => {
    setFinalTableActive(true);
    setFinalTableEliminated([]);
    const finalWindow = window.open("", "Table Finale", "width=800,height=600");
    if (finalWindow) {
      finalWindow.document.write("<html><head><title>Table Finale</title><style>body{font-family:sans-serif;text-align:center;padding:2rem}h1{margin-bottom:2rem}.player{margin:1rem;padding:1rem;border-radius:50%;background:#eee;width:150px;height:150px;display:inline-flex;align-items:center;justify-content:center;font-size:1.2rem}</style></head><body><h1>Table Finale</h1>");
      finalTablePlayers.forEach(p => {
        finalWindow.document.write(`<div class='player'>${p}</div>`);
      });
      finalWindow.document.write("</body></html>");
      finalWindow.document.close();
    }
  };

  const eliminateFinalPlayer = (name) => {
    setFinalTablePlayers(finalTablePlayers.filter((p) => p !== name));
    setFinalTableEliminated([name, ...finalTableEliminated]);
  };

  const finalRanking = [...finalTableEliminated, ...finalTablePlayers.reverse()];
  const totalPot = finalRanking.length * buyIn;
  const prizeDist = [70, 15, 10, 5];

  const sortedGlobalScores = Object.entries(globalScores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Tilt Nation</h1>

      <Tabs defaultValue="cash" className="space-y-4">
        <TabsList className="flex justify-center">
          <TabsTrigger value="cash">Cash Game</TabsTrigger>
          <TabsTrigger value="tournament">Tournoi</TabsTrigger>
        </TabsList>

        <TabsContent value="cash">
          {/* Onglet Cash Game inchangé */}
        </TabsContent>

        <TabsContent value="tournament">
          <div className="text-center text-xl font-semibold text-green-600 mb-4">
            💰 Cagnotte tournoi : {Object.keys(globalScores).length * buyIn}€
            <div className="text-base text-black mt-1">
              Répartition : 1ᵉ 70% | 2ᵉ 15% | 3ᵉ 10% | 4ᵉ 5%
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
