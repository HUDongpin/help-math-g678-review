# P018 static frame-domain scope

Physical SWF has root10 frames, sprite2 one frame and sprite32 648 frames. Root frame6 places sprite2 at depth1 and sprite32 at depth3 named animation. These are declared and statically reachable domains, not an observed Flash natural trace.

Root metadata remains10 frames. The animation implementation must give sprite32 its own independent domain and source-entry binding; do not replace root metadata with648. Sprite2 is a one-frame visual child and cannot be dropped without checking root compositing. Exact XML is output/alg-l06-p018-canvas-v1/source.xml. The time-resolved audit will record masks, placement clocks and scripted stops.

The scaffold root EN/ES coverage requirements remain pending; they are not sufficient coverage of the nested animation or five glossary scenarios. Original-runtime frame-domain dispositions, entry traces and complete coverage must be added before strict comparison. No generated candidate or static export closes those gates.
