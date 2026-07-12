import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

async function generateVectorEmbeddingForFile(path) {
  const loader = new PDFLoader(path);
  const document = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(document);

  const embedding = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: "",
    outputDimensionality: 768,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embedding,
    {
      url: "http://localhost:6333",
      collectionName: "chaicode-rag-docs",
    },
  );

  try {
    const BATCH_SIZE = 50;

    for (let i = 0; i < splitDocs.length; i += BATCH_SIZE) {
      const batch = splitDocs.slice(i, i + BATCH_SIZE);

      console.log(`Uploading batch ${i / BATCH_SIZE + 1}`);

      await vectorStore.addDocuments(batch);
    }
  } catch (error) {
    console.log(error);
  }
}
generateVectorEmbeddingForFile("./dsa.pdf");
console.log("All the documents are indexes...");
