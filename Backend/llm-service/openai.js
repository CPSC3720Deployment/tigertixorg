import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const response = openai.responses.create({
  model: "gpt-5-nano",
  input: "write a haiku about ai",
  store: true,
});

response.then((result) => console.log(result.output_text));