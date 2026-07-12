import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";

const API_KEY = "";

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function query(userQuery) {
  // Query to vector embedding
  // search the vector in store
  // get similar vector and search
  // feed those chunks in llm and do simple chat

  const embedding = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2-preview",
    apiKey: API_KEY,
    outputDimensionality: 768,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embedding,
    {
      url: "http://localhost:6333",
      collectionName: "chaicode-rag-docs",
    },
  );

  const vectorRetriver = vectorStore.asRetriever({ k: 5 });
  const result = await vectorRetriver.invoke(userQuery);

  const SYSTEM_PROMPT = `
    You are an expert in answering the user query based on the only provided context about document. Make sure to give the answer which is more relevent to the User Query. 
    Do not answer anything beyond what is provided.

    Always answer is in short and tell on which page number that content is available with book name.

    User Documents: 
    ${result
      .map((e) =>
        JSON.stringify({
          bookName: e.metadata.source,
          pageContent: e.pageContent,
          pageNumber: e.metadata.loc.pageNumber,
        }),
      )
      .join("/n/n")} 
  `;

  const llmResponse = await client.chat.completions.create({
    model: "gemini-3-flash-preview",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
  });

  console.log("LLM Response:", llmResponse.choices[0].message.content);
}

query("What is SQL?");
