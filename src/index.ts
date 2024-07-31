import puppeteer from "puppeteer";
import fs from "fs";

interface Game {
  name: string;
  describe: string;
  time: string;
  date: string;
}


async function webScraping() {
  const url: string = `https://olympics.com/pt/paris-2024/calendario/brasil?day=27-julho`;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    await page.locator("#onetrust-pc-btn-handler").click();
    await page.locator(".ot-pc-refuse-all-handler").click();

    const todaysGames: Array<Game> = await page.evaluate(() => {
      const elements = document.querySelectorAll(".emotion-srm-1e3atp");

      const games: Game[] = [];

      elements.forEach((element) => {
        const timeElement = element.querySelector("time.emotion-srm-1myzqq1");
        const datetime = timeElement?.getAttribute("datetime") || "N/A";
        const day = datetime.split("T")[0]; // Obtém a parte da data antes do 'T'

        games.push({
          name:
            element.querySelector(".discipline-title")?.textContent || "N/A",
          describe:
            element.querySelector(".discipline-sub-title")?.textContent ||
            "N/A",
          time:
            element.querySelector(".emotion-srm-1myzqq1")?.textContent || "N/A",
          date: day,
        });
      });

      return games;
    
    });
    return todaysGames;

  } catch (error) {
    console.error(error);
    return [];
  } finally {
    await browser.close();
  }
}

function saveInDB(file: string, data: Array<Game>): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}



async function main() {
  const DB_FILE_PATH = "./src/games.json";
  const games = await webScraping();
  console.log(games);
  saveInDB(DB_FILE_PATH, games);
}

main();
