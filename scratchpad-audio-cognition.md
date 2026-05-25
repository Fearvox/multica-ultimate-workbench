# SCRATCHPAD — Time-Native Audio Cognition Memo

Tracking: searches run, papers verified, papers UNVERIFIED, dead-ends, contested claims.

## Status legend
- [VERIFIED] = found primary source (arXiv/DOI/journal), read abstract or full
- [FETCHED] = web_fetch on full text done
- [UNVERIFIED] = mentioned but could not confirm existence/details
- [DEAD] = search returned nothing useful

## Search log
(append as I go)

## Verified citations
(append: title, authors, year, arXiv/DOI, one-line claim it supports)

- [VERIFIED] Vocos, Siuzdak 2023, arXiv 2306.00814 — GAN vocoder predicting complex STFT coeffs; circular activation for phase-wrapping; matches time-domain quality at lower compute.
- [VERIFIED] CPC, van den Oord et al 2018, arXiv 1807.03748 — InfoNCE, predict future latents; CPC > MFCC/filterbank on ABX phone discrim.
- [VERIFIED] APC (autoregressive predictive coding) — predict future fbank N steps ahead; NPC (non-autoregressive) Liu et al Interspeech 2021 (MIT SLS).
- [VERIFIED] A-JEPA, Fei et al 2023, arXiv 2311.15830 — JEPA on mel-spec patches, curriculum TF masking; SOTA on audio/speech classif.
- [VERIFIED] Audio-JEPA, Tuncay/Labbé et al 2025, arXiv 2507.02915 — JEPA on AudioSet mel-spec, random patch masking.
- [VERIFIED] Deep Complex U-Net, Choi et al 2019, arXiv 1903.03107 — complex-valued SE, estimates phase via complex mask.
- [VERIFIED] DCCRN, Hu et al 2020, arXiv 2008.00264 — deep complex conv recurrent net, phase-aware SE, Interspeech DNS winner.
- [VERIFIED] SaShiMi, Goel et al ICML 2022, arXiv 2202.09729 — multi-scale (multi-tier downsample) S4 for autoregressive raw waveform; Hurwitz stability fix.
- [VERIFIED] Tuckute, Feather, Boebinger, McDermott 2023, PLOS Biology, "Many but not all DNN audio models capture brain responses..." bioRxiv 2022.09.06.506680; DOI 10.1371/journal.pbio.3002366 — model-stage→region correspondence; noise-trained > quiet-trained.
- [VERIFIED] Feather, Leclerc, Madry, McDermott 2023, Nature Neuroscience 26:2017-2034, "Model metamers reveal divergent invariances..." bioRxiv 2022.05.19.492678; DOI 10.1038/s41593-023-01442-0 — model metamers unrecognizable to humans; idiosyncratic per-model invariances.
- [VERIFIED] MARBLE, Yuan et al NeurIPS 2023 D&B, arXiv 2306.10548 — 18 MIR tasks / 12 datasets; MERT strong baseline.
- [LEAD] "Better audio representations are more brain-like..." arXiv 2511.16849 (2025) — links model-brain alignment to downstream auditory task perf. NEEDS FETCH for §4.
- [LEAD] STFTCodec arXiv 2503.16989; "Prosody-Guided Harmonic Attention...Phase-Coherent Neural Vocoding" arXiv 2601.14472 — phase in codecs §1.

## Contested claims (both sides)
- PHASE perceptual importance: Vocos says "literature gives no definitive answer." BUT modified-relative-phase cuts spoofing EER 1.883%->0.013% (phase highly discriminative for synthetic-speech detection). AND Saddler 2024: phase-locking needed for localization+voice, NOT word recognition. => phase matters TASK-DEPENDENTLY.
- UNTRAINED-BASELINE critique: Strong in LANGUAGE/vision (architecture alone drives much predictivity; shallow untrained attention nets predict brain — 2406.15109; Hosseini/Schrimpf 2024 NoL). BUT in AUDIO, Tuckute permuted-weight controls UNDERPERFORMED trained models + baseline. => critique weaker for audio. Stronger audio critique = Feather metamers (high predictivity != aligned invariances).
- BRAIN ALIGNMENT meaning: Pepino 2025 (2511.16849) r>0.8 task-perf vs brain-alignment across 36 models. Pro: good models are brain-like. Con: could be incidental byproduct; linear-encoding + variance-explained inflates (metamers show divergent invariances).
- PREDICTIVE CODING neural basis: MMN/omission responses support hierarchical predictive coding (Wacongne 2012, PMC6703454). BUT adaptation model still competes (PMC8640521, PubMed 27752799). Even the bio motivation is contested.
- LEARNABLE/BIO FRONTENDS: LEAF paper claims 76.9 vs 73.9 mel. BUT EfficientLEAF (Eusipco 2022) "of Questionable Use" — neither beats fixed mel across 6 tasks reliably.
- MULTI-SCALE achieved vs assumed: HiPPO/Δ log-uniform(0.001,0.1) gives intra-layer timescale SPREAD; learning P per-state timescales > single shared. SaShiMi = explicit arch multi-tier. Most audio Mamba = single-scale stacks. Genuine learned hierarchy rare.

## Dead-ends / absence-confirmations
- ACTIVE LISTENING (§7): exists fragmented in ROBOTICS (head-movement localization IEEE 7179048; Bayesian head-rotation ITD PMC5629026; active acoustic sensing manipulation 2308.01600; interactive auditory object exploration 1807.01035) and LLM-agent tool-orchestration (OmniAgent 2512.23646). NOT integrated with modern deep audio representation learning. Active listening as learned uncertainty-reducing policy coupled to repn learning = essentially ABSENT. Confirmed sparse.
- Clean head-to-head: forward-predictive vs masked-infilling SSL on TEMPORAL-DIRECTIONALITY audio probes = NOT FOUND. Gap.

## Citation ledger (final) — see body; key IDs verified this session.
- data2vec: cite Baevski et al 2022, ID NOT reverified -> omit numeric ID.
- S5: cite Smith et al ICLR2023 by name (OpenReview Ai8Hw3AXqks), ID not reverified.
- MS-SSM 2512.23824: listing-only, do NOT lean on specifics.
- NEST-RQ 2409.08680: forward/next-token speech SSL — relevant §3 (forward-prediction revival).

## Dead-ends / absence-confirmations
(append)

## Per-section notes
### §1 Phase-aware representation
KEY DISTINCTION (use vs preserve vs generate):
- Vocos (2306.00814): predicts phase as OUTPUT via circular activation cos(p)/sin(p) -> wraps to (-pi,pi]. INPUT is mel (magnitude only). So GENERATES phase, does not USE it. ~68x faster than BigVGAN (GPU), iSTFT vs transposed conv. Quality parity (PESQ 3.70 vs 3.69).
- Vocos quote: "literature does not provide a definitive answer regarding the perceptual importance of phase" -> CONTESTED whether phase matters perceptually.
- Time-domain codecs (Encodec/DAC/SoundStream): IMPLICIT phase (operate on waveform). Need hundreds of up/downsample ops.
- Spectral codecs APCodec (2402.10533), STFTCodec (2503.16989), SpectroStream (2508.05207): EXPLICIT parallel amplitude+phase branches. For RECONSTRUCTION.
- Discriminative USE of phase: complex spectral mapping SE (DCCRN 2008.00264, DCUnet 1903.03107) uses noisy phase + estimates clean phase. Still signal-output not understanding.
- GAP: recognition/understanding models almost universally discard phase (mel-spec). Phase as a COGNITIVE cue for understanding is rare. Need: anti-spoofing/group-delay as the exception.

### §3 IDyOM + music prediction
- IDyOM (Pearce 2005, 2012 Topics in Cog Sci; 2018 Annals NYAS) — symbolic, variable-order Markov, multiple-viewpoint, predicts pitch+onset, info content/entropy. Models human melodic expectation via statistical learning. >300 cites. This is PREDICTIVE CODING of music but symbolic.
- "Deep Generative Models of Music Expectation" arXiv 2310.03500 (Lizé Masclef) — connects DL to expectation.

### §8 audio-visual sync
- Owens & Efros 2018 "Audio-Visual Scene Analysis w/ Self-Supervised Multisensory Features" 1804.03641 — misalignment detection pretext.
- SyncNet / "Perfect Match" 1809.08001 — AV sync embeddings.
- CAV-MAE Sync 2505.01237 — fine-grained AV alignment.
- CrissCross 2111.05329 — relaxed temporal synchronicity helps.
- AV-sync pretext is INHERENTLY temporal — strongest case for cross-modal improving temporal cognition. NEED evidence it transfers to temporal tasks.
### §2 Multi-scale temporal architecture
### §3 Predictive-coding objectives in audio
### §4 Brain-aligned audio models
### §5 Music as temporal benchmark
### §6 Biological frontends
### §7 Active listening
### §8 Cross-modal grounding
### §9 Open problems
### §10 Experiments
