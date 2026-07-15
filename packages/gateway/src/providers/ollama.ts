import { BaseProvider } from "./baseprovider.js";
import {ProviderError, UnifiedCompletionRequest, UnifiedCompletionResponse } from "./types.js";

export class OllamaProvider extends BaseProvider{
    name="ollama"
    async complete(request:UnifiedCompletionRequest):Promise<UnifiedCompletionResponse>{
        try{
            const response=await fetch("http://localhost:11434/api/chat",{
                method:"POST",
                body:JSON.stringify({
                    model:request.model?? "llama3.2:3b",
                    messages:request.messages,
                    options:{
                        maxTokens:request.maxTokens,
                        temperature:request.temperature,
                    },
                    stream:false
                })
            })
            const ollamaContent=await response.json();
            this.recordResult(true);
            return {
                content:ollamaContent.message.content,
                provider:"ollama",
                model:ollamaContent.model,
                tokensIn:ollamaContent.prompt_eval_count,
                tokensOut:ollamaContent.eval_count,
                costUsd:0,
                latencyMs:ollamaContent.total_duration/1000000,
                cacheHit:false
            }
        }
        catch(err:any){
            this.recordResult(false);
            throw new ProviderError("ollama",err,err.message);
        }
    }
}