
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "./ui/tabs";

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
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-xl font-semibold">Nouvelle soirée</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Nom du joueur"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button onClick={addPlayer}>Ajouter joueur</Button>
              </div>
              <div className="flex gap-2 items-center">
                <label>Buy-in:</label>
                <Input
                  type="number"
                  value={buyIn}
                  onChange={(e) => setBuyIn(Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="space-y-1">
                {activePlayers.map((p) => (
                  <div key={p} className="flex gap-2 items-center">
                    <span>{p}</span>
                    <Button size="sm" onClick={() => eliminatePlayer(p)}>Éliminer</Button>
                    <Button size="sm" onClick={() => addRecave(p)}>+ Recave</Button>
                    <span className="text-sm">Recaves: {recaves[p] || 0}</span>
                    <Input
                      type="number"
                      placeholder="Gain (€)"
                      className="w-24"
                      onChange={(e) => setGains({ ...gains, [p]: Number(e.target.value) })}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={finalizeCashGameSession}>Enregistrer la soirée</Button>
              <h2 className="text-lg font-semibold mt-4">Classement</h2>
              <ul>
                {sessions.map((s, i) => (
                  <li key={i} className="mb-2">
                    <strong>Soirée #{i + 1} — {s.date}</strong>
                    <ul>
                      {[...s.players].sort((a, b) => (s.profit[b] || 0) - (s.profit[a] || 0)).map((p, idx) => (
                        <li key={p}>{idx + 1}ᵉ : {p} — Profit : {s.profit[p]}€</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournament">
          <div className="text-center text-xl font-semibold text-green-600 mb-4">
            💰 Cagnotte tournoi : {Object.keys(globalScores).length * buyIn}€
            <div className="text-base text-black mt-1">
              Répartition : 1ᵉ 70% | 2ᵉ 15% | 3ᵉ 10% | 4ᵉ 5%
            </div>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-xl font-semibold">Nouvelle manche de tournoi</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Nom du joueur"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button onClick={addPlayer}>Ajouter joueur</Button>
              </div>
              <div className="flex gap-2 items-center">
                <label>Buy-in:</label>
                <Input
                  type="number"
                  value={buyIn}
                  onChange={(e) => setBuyIn(Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="space-y-1 pt-4">
                {activePlayers.map((p) => (
                  <div key={p} className="flex gap-2 items-center">
                    <span>{p}</span>
                    <Button size="sm" onClick={() => eliminatePlayer(p)}>Éliminer</Button>
                  </div>
                ))}
              </div>
              <Button onClick={finalizeTournamentRound}>Générer le classement</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">Classement général</h2>
              <ul>
                {sortedGlobalScores.map(([name, score], idx) => (
                  <li key={name}>{idx + 1}ᵉ : {name} — Score : {score}</li>
                ))}
              </ul>
              <Button className="mt-4" onClick={toggleFinalTable}>
                {showFinalTableSelect ? "Fermer la sélection" : "Accéder à la table finale"}
              </Button>
              {showFinalTableSelect && (
                <div className="mt-4 space-y-2">
                  {Object.keys(globalScores).map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={finalTablePlayers.includes(p)}
                        onChange={() => handleToggleFinalPlayer(p)}
                      />
                      <label>{p}</label>
                    </div>
                  ))}
                  <Button className="mt-2" onClick={launchFinalTable}>
                    Lancer la table finale
                  </Button>
                </div>
              )}

              {finalTableActive && (
                <div className="mt-6 space-y-4">
                  <h2 className="text-lg font-semibold">Table Finale en cours</h2>
                  <div className="flex flex-wrap gap-2">
                    {finalTablePlayers.map((p) => (
                      <div
                        key={p}
                        className="rounded-full bg-gray-200 px-4 py-2 flex items-center gap-2"
                      >
                        <span>{p}</span>
                        <Button size="sm" onClick={() => eliminateFinalPlayer(p)}>Éliminer</Button>
                      </div>
                    ))}
                  </div>

                  {finalTablePlayers.length === 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mt-4">Classement final</h3>
                      <ul>
                        {finalRanking.map((p, i) => (
                          <li key={p}>{i + 1}ᵉ : {p} — Gain : {((prizeDist[i] || 0) * totalPot / 100).toFixed(2)}€</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
