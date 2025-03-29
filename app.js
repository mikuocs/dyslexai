const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const pluralize = require("pluralize");
const app = express();

// Load synonyms from a JSON file
const synonyms = JSON.parse(fs.readFileSync(path.join(__dirname, "synonyms.json"), "utf8"));

// Server settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Function to check if the word is plural
function isPlural(word) {
  return pluralize.isPlural(word);
}

// Function to replace the word with the appropriate synonym based on the context
function replaceWithSynonym(word) {
  const lowerCaseWord = word.toLowerCase();

  // Check if the word has a synonym in our large synonym dictionary
  if (synonyms[lowerCaseWord]) {
    let synonym = synonyms[lowerCaseWord][0]; // Default to first synonym

    // Handle plural form separately
    if (isPlural(word) && synonyms[lowerCaseWord + "s"]) {
      synonym = synonyms[lowerCaseWord + "s"][0];  // Plural form
    }

    return synonym;
  }
  return word;  // If no synonym, return the original word
}

// Function to process the input text and apply synonym replacement
function processText(text) {
  const tokens = text.split(/\s+/);  // Split the input text into individual words

  // Map over each word in the text and replace with synonym if applicable
  let processedText = tokens.map(token => {
    return replaceWithSynonym(token);  // Replace each token with a synonym
  }).join(" ");

  // Preserve newlines by replacing \n with <br>
  processedText = processedText.replace(/\n/g, '<br>');  // Handle line breaks

  return processedText;
}

// Main route for the app
app.get("/", (req, res) => {
  res.render("index", { transformedText: "" });
});

app.post("/", (req, res) => {
  const inputText = req.body.inputText;
  let transformedText = processText(inputText);  // Process the input text and apply transformations
  res.render("index", { transformedText });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`DyslexAI listening on port ${port}`);
});
