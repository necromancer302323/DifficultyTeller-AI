import { OpenRouter } from "@openrouter/sdk";
import "dotenv/config"; 
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'node:readline/promises';


async function readRepo(path:string){
 fs.readdir(path,"utf-8",(err,data)=>{
   if(err){
    console.log(err)
   }else{
    console.log(data)
    return data
   }
})

}




const TOOL_MAPPING = {
  readRepo,
};

const tools = [
  {
    type: 'function'as const,
    function: {
      name: 'Read repo',
      description:
        'Reads the repositry/folder of the path given and gives you back the structure of the repositry',
      parameters: {
        type: 'string',
        properties: {
          path: {
            type: 'string',
            description:
              "The exact path which the the tool reads and give you its stucture with folder and file names",
          },
        },
        required: ['path'],
      },
    },
  },
];

   const rl = readline.createInterface({   input: process.stdin, 
        output: process.stdout  });
const openrouter = new OpenRouter({
 apiKey: process.env.OPENROUTER_API_KEY ?? "" 
});
 const question = await rl.question('What do you wana ask? ');
const result = ( await openrouter.chat.send({
chatRequest:{
  model: "dots-studio/dots-3-note-preview:free",
  tools,
  messages:[{role:"system",content:"tell user what the repositry contains based on the the path they provide"},
    ],
  stream:true
}
})) as unknown as AsyncIterable<any>; 

let response_1 =""
for await (const chunk of result) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    response_1 += content;
    process.stdout.write(content);
  }


  // Usage information comes in the final chunk
  if (chunk.usage) {
    console.log("\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens);
  }
}


