import { OpenRouter } from "@openrouter/sdk";
import type { ChatFunctionTool } from "@openrouter/sdk/models";
import "dotenv/config";
import { readdir,readFile } from "node:fs/promises";
import * as readline from "node:readline/promises";

async function readRepo(path: string) {
  const data = await readdir(path, { recursive: true }); 
    console.log(data);
    return data;
}


async function FileReader(path:string) {
  const data = await readFile(path,"utf-8")
  console.log(data)
}
const tools:ChatFunctionTool[] = [
  {
    type: "function" as const,
    function: {
      name: "FileReader",
      description:
        "Reads the file of the path given and gives you back the contents of the file",
      parameters: {
        type: "string",
        properties: {
          path: {
            type: "string",
            description:
              "The exact path which the the tool reads and give you its stucture with folder and file names",
          },
        },
        required: ["path"],
      },
    },
  },
];



const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});
const filePath = await rl.question("File path of the dir you are working on today ");
const question = await rl.question("What do you wana ask? ");
const result = (await openrouter.chat.send({
  chatRequest: {
    model: "dots-studio/dots-3-note-preview:free",
    tools: [
    {
      "type": "function" as const,
       "function": {
      "name": "FileReader",
      "description":
        "Reads the file of the path given and gives you back the contents of the file",
      "parameters": {
        "type": "string",
        "properties":{
          "path": {
            "type": "string",
            "description":
              "The exact path which the the tool reads and give you its stucture with folder and file names",
          },
        },
        required: ["path"],
      },
  }}],
    messages: [
      {
        role: "system",
        content:
          "Your a senior programmer with 10+ years of experience your only job is to tell the user how difficult a task is based on the the repositry they provide by telling if is easy|medium|hard ",
      },
      //examples
  
      {role:"system",
        content:"anything based on adding a feature will be will be a medium level task if its only a ui/ux thing but other wise a whole new feature from scratch is hard thing to do "
      }
    ,
      {role:"system",
        content:"if someone asks you to perform CRUD operations in a data base or creat a db That will always be a hard level task as the db contains valuabe info and should be handles with care"
      },
      //example ends
      {role:"system",content:`repositry structure : ${await readRepo(filePath)}`},
      { role: "user", content: `${question}` },
    ],
    stream: true,
  },
})) as unknown as AsyncIterable<any>;

let response_1 = "";
for await (const chunk of result) {
  const content = chunk.choices[0]?.delta?.content;

  if (content) {
    response_1 += content;
    process.stdout.write(content);
  }

  // Usage information comes in the final chunk
  if (chunk.usage) {
    console.log(
      "\nReasoning tokens:",
      chunk.usage.completionTokensDetails?.reasoningTokens,
    );
  }
}
