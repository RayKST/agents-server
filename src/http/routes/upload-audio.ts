import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { generateEmbeddings, transcribeAudio } from '../../services/gemini.ts'

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        params: z.object({
            roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
        const { roomId } = request.params;
        const audio = await request.file();

        if (!audio) {
            throw new Error ('Audio is required');
        }
        
        // transcrever audio
        const audioBuffer = await audio.toBuffer();
        const audioAsBase64 = await audioBuffer.toString('base64');


        const transcription = await transcribeAudio(
            audioAsBase64,
            audio.mimetype,
        )
        
        // gerar vetor semántico

         const embeddings = await generateEmbeddings(transcription);

        // armazenas os vetores

        const result = await db
        .insert(schema.audioChunks)
        .values({
            roomId,
            transcriptions: transcription,
            embeddings
        })
        .returning();
        
        const chunk = result[0];

        if (!chunk){
            throw new Error('Erro ao salvar chunk de áudio')
        }
        
        return reply.status(201).send({ chunkId: chunk.id })
       }

  )
}
