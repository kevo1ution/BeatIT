import os
from magenta.models.music_vae import music_vae_generate as mv_gen
from magenta.protobuf import generator_pb2
from magenta.protobuf import music_pb2

import magenta.music as mm
import magenta.music.midi_io as mmio

import subprocess

def make_music(extracted_bpm):
    BUNDLE_DIR = '/Users/engrbundle/Desktop/MusicGeneration/MusicVAE/'
    MODEL_DIR = 'hierdec-trio_16bar.tar'

    flags = {}
    flags["output_dir"] = "/Users/engrbundle/Desktop/TeamBeatIt/BeatIt/magentabackend/output"
    flags["config"] = "hierdec-trio_16bar"
    flags["checkpoint_file"] = "/Users/engrbundle/Desktop/TeamBeatIt/BeatIt/server/flaskTests/hierdec-trio_16bar.tar"
    flags["mode"] = "sample"
    # flags["input_midi_1"] =
    # flags["input_midi_2"] =
    flags["num_outputs"] = 1
    flags["max_batch_size"] = 2
    flags["temperature"] = 1.4


    sequence_list = mv_gen.main_program(os.path.join(BUNDLE_DIR, MODEL_DIR), flags)
    sequence = sequence_list[0]

    ratio = 120 / extracted_bpm

    #Base QPM: 120
    sequence.tempos[0].qpm = int(round(120 * ratio))


    #qpm / 60 * (number of measures = 16)
    # 120 quarter notes a minute
    # 30 full notes a minute
    # .5 full notes a seconds
    # 1 full note every 2 seconds
    # 16 full notes in 32 seconds

    # 90 / 60 * 16 = 24 seconds

    print("Total time ", sequence.total_time)
    print(dir(sequence))
    test = "C Bb F G C Bb F G"
    # test = "C B7 Em C B7 Em C B7 C" sad

    # Create backing chord progression from flags.
    raw_chords = test.split()

    #Base steps_per_chord = 32
    steps_per_chord = int(round(32 * ratio))
    repeated_chords = [chord for chord in raw_chords for _ in range(steps_per_chord)]
    backing_chords = mm.ChordProgression(repeated_chords)

    print(dir(sequence))
    total_seconds = sequence.total_time

    CHORD_SYMBOL = music_pb2.NoteSequence.TextAnnotation.CHORD_SYMBOL

    # Add the backing chords to the input sequence.
    #Base backing_qpm = 60
    chord_qpm = int(round(60 * ratio))
    chord_sequence = backing_chords.to_sequence(sequence_start_time=0.0, qpm=chord_qpm)
    for text_annotation in chord_sequence.text_annotations:
      if text_annotation.annotation_type == CHORD_SYMBOL:
        chord = sequence.text_annotations.add()
        chord.CopyFrom(text_annotation)
    # input_sequence.total_time = len(backing_chords) * seconds_per_step

    for note in sequence.notes:
        if note.is_drum and note.program == 0: #Changing to new drum
            note.is_drum = True
            note.instrument = 2
            if note.pitch == 51:
                note.velocity = 0
        elif note.program == 0 and note.instrument == 0 and not note.is_drum: #Changing from piano to space void
            note.velocity = 0
        elif note.instrument == 1 and note.program == 33:
            note.velocity = 0
        elif note.program == 87:
            print("This is a fifth")

    CHORD_VELOCITY = 50
    renderer = mm.BasicChordRenderer(velocity=CHORD_VELOCITY)
    renderer.render(sequence)

    mm.sequence_proto_to_midi_file(sequence, '/Users/engrbundle/Desktop/TeamBeatIt/BeatIt/server/musicvae.mid')
    print("New sequence was made")
    test = subprocess.Popen(["timidity","musicvae.mid","-Ow","-o", "musicvae.wav"], stdout=subprocess.PIPE)
    output = test.communicate()[0]
    print("Was run!!")

    print("Midi file has been generated")
    # music_vae_generate \
    # --config=hierdec-trio_16bar \
    # --checkpoint_file=/Users/engrbundle/Desktop/MusicGeneration/MusicVAE/hierdec-trio_16bar.tar \
    # --mode=sample \
    # --num_outputs=1 \
    # --output_dir=/Users/engrbundle/Desktop/MusicGeneration/RapBeats/output
