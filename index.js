const REPOSITORY_NAME = process.env.REPOSITORY_NAME || require("prompt-sync")({ sigint: true })("Enter Repository Name (e.g. /@ayunami2000/eaglercraft): ");
const UPDATE_TIME = 5000;
const ANIM_TIME = 1000;


const fetch = require("@replit/node-fetch");
const Diff = require("diff");

const query = `
query ReplView($url: String!) {
  repl(url: $url) {
    ... on Repl {
      title
      publicForkCount
      runCount
      commentCount
      likeCount
      owner {
        ... on Team {
          username
          followerCount
        }
        ... on User {
          username
          followerCount
        }
      }
    }
  }
}
`;

const options = {
  method: "POST",
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Origin": "https://repl.it",
    "Referrer": "https://replit.com/",
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ operationName: "ReplView", variables: { url: REPOSITORY_NAME }, query }),
};

let stats = {};

function upd() {
  fetch("https://replit.com/graphql", options).then(response => response.json()).then(json => {
    const newStats = json.data.repl;
    if (JSON.stringify(stats) != JSON.stringify(newStats)) {
      stats = newStats;
      drawStats();
    }
    setTimeout(upd, UPDATE_TIME);
  }).catch(err => {
    console.error(err);
    setTimeout(upd, UPDATE_TIME);
  });
}

let lastText = "";
let animTimeout = -1;

function drawStats() {
  clearTimeout(animTimeout);
  animTimeout = -1;
  const changeText = "\033[0m\033[3mLast Change:\033[0m\033[3m " + new Date().toUTCString() + "\n\n";
  const text = "\033[0m\033[1m" + stats.title + "\n\033[0m\033[4mForks:\033[0m " + stats.publicForkCount + "\n\033[0m\033[4mRuns:\033[0m " + stats.runCount + "\n\033[0m\033[4mLikes:\033[0m " + stats.likeCount + "\n\033[0m\033[4mComments:\033[0m " + stats.commentCount + "\n\n\033[1m" + stats.owner.username + "\n\033[0m\033[4mFollowers:\033[0m " + stats.owner.followerCount;
  if (lastText.length == 0) {
    lastText = text;
  }
  const diff = Diff.diffWords(lastText, text);
  lastText = text;
  let out = "";
  diff.forEach(part => {
    if (!part.removed) {
      if (part.added) {
        out += "\033[0;32m";
      }
      out += part.value;
    }
  });
  console.clear();
  console.log(changeText + out);
  animTimeout = setTimeout(() => {
    console.clear();
    console.log(changeText + text);
  }, ANIM_TIME);
}

upd();
