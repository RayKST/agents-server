ALTER TABLE "audio_chuncks" RENAME TO "audio_chunks";--> statement-breakpoint
ALTER TABLE "audio_chunks" DROP CONSTRAINT "audio_chuncks_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "audio_chunks" ADD CONSTRAINT "audio_chunks_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;