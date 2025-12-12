// engine/src/cli.js
// Simple terminal demo for the GameEngine.

const readline = require("node:readline");
const { GameEngine } = require("./engine");

async function main() {
  const engine = new GameEngine();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
  }

  console.log("Think of a character from: anime / movies / YouTube.");
  let steps = 0;

  while (true) {
    const best = engine.getBestGuess();
    if (best.p > 0.8 || steps >= 15) {
      console.log(
        `\nMy guess is: ${best.character.name} (p=${best.p.toFixed(2)})`
      );
      break;
    }

    const q = engine.getNextQuestion();
    if (!q) {
      console.log("\nNo more questions. Best guess:", best.character.name);
      break;
    }

    const ans = await ask(
      `\nQ${steps + 1}: ${q.text} (yes/no/idk/probably/probably_not): `
    );
    const a = ans.trim().toLowerCase();
    engine.applyAnswer(q, a);
    steps++;
  }

  rl.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
