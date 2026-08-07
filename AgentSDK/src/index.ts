import { Agent, AgentBuilder } from "./app/agent.js";
import type { ITool } from "./app/agent.js";

const weatherTool: ITool = {
  name: "fetchWeatherInfo",
  description: "Fetches realtime weather data by cityname",
  doc: "fetchWeatherInfo(cityName: string): WeatherReport",
  async executor(cityName) {
    return "It is 30 deg cel";
  },
};

async function init() {
  const agent: Agent = Agent.builder()
    .setInstructions("You are a helpful assistant.")
    .tool(weatherTool)
    .build();

  const result = await agent.run("Can you tell me the Weather of Delhi");
  console.log(result);
}

init();
