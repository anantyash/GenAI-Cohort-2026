import OpenAI from "openai";
import { HARNESS_PROMPT } from "./config.js";

export interface IMessage {
  role: "user" | "assistant" | "developer";
  content: string;
}

export interface ITool {
  name: string;
  description: string;
  doc?: string;
  executor: (input: string) => Promise<string>;
}

export class AgentBuilder {
  public instructions: string | undefined;
  public toolList: ITool[];

  constructor() {
    this.toolList = [];
  }

  public setInstructions(instructions: string) {
    this.instructions = instructions;
    return this;
  }

  public tool(t: ITool) {
    this.toolList.push(t);
    return this;
  }

  public build() {
    return new Agent(this);
  }
}

// Agent Creation and Execution
export class Agent {
  private instructions: string;
  private messagesHistory: IMessage[];
  private toolMap: Map<string, ITool>;
  private openai: OpenAI;

  private MAX_LOOP = 30;

  constructor(builder: AgentBuilder) {
    this.toolMap = new Map();
    this.openai = new OpenAI({
      apiKey: "",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    for (const t of builder.toolList) {
      this.toolMap.set(t.name, t);
    }

    this.instructions = ` ${HARNESS_PROMPT}\n\n
      
      SYSTEM PROMPT:
      ${builder.instructions} 

      Available Tools:
      ${builder.toolList.map((t) => JSON.stringify({ functionName: t.name, functionDescription: t.description, functionDoc: t.doc })).join("\n")}

    `;
    this.messagesHistory = [];
  }
  static builder() {
    return new AgentBuilder();
  }

  public async run(query: string) {
    this.messagesHistory.push({ role: "user", content: query });

    for (let i = 0; i < this.MAX_LOOP; i++) {
      const llmResponse = await this.openai.chat.completions.create({
        model: "gemini-3.6-flash",
        messages: [
          { role: "system", content: this.instructions },
          ...this.messagesHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      });

      // Append  to Messages History
      const rawLLMResponse: string = llmResponse.choices[0]?.message
        .content as string;

      // parse the Raw LLM Response to JSON
      const parsedResult = JSON.parse(rawLLMResponse);

      if (parsedResult.step.toLowerCase() === "output")
        return this.messagesHistory;

      if (parsedResult.step.toLowerCase() === "tool_request") {
        const { functionName, input } = parsedResult;
        const tool = this.toolMap.get(functionName);

        if (!tool) {
          this.messagesHistory.push({
            role: "developer",
            content: `Error: Function ${functionName} not found in toolMap.`,
          });
          continue;
        }

        const toolResult = await tool.executor(input);
        this.messagesHistory.push({
          role: "developer",
          content: JSON.stringify({ functionName, input, toolResult }),
        });
      }
    }
  }
}
