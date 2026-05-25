# Time-Native Audio Cognition — Research-Direction Memo

**Date:** 2026-05-25 · **Author:** Claude (Opus) · **Status:** for side-by-side comparison vs ChatGPT Deep Research and Gemini on the same brief.

**Method note.** ~30 targeted web searches with depth-first reading; key papers fetched in full (Vocos, Tuckute 2023, Saddler & McDermott 2024, Pepino 2025). Every arXiv ID / DOI below was either fetched or confirmed against the source's own abstract page this session, *except* where marked `[ID-unverified]` or `[listing-only]`. I omit IDs I could not re-confirm rather than guess them. Where a claim is contested, both sides are named. This memo competes on per-claim quality, not breadth — it will lose to DR on coverage by design.

---

## Framing: steelman and counter-steelman of the thesis

The brief's thesis — *time-domain audio cognition needs architectures genuinely native to time; convert-time-to-space (spectrograms) is a category error* — is **half right, and the wrong half is load-bearing.** The honest evidence pattern, assembled below, is **task-stratified**, not categorical:

- For **word/phoneme recognition in noise**, fine temporal structure is *demonstrably unnecessary* — mel-spectrogram + masked-prediction SSL is at or near ceiling, and explicitly modeling auditory-nerve spike timing buys nothing (Saddler & McDermott 2024, below). Here "time-to-space" is not a category error; it is an efficient, sufficient statistic.
- For **sound localization, voice/speaker identity, pitch under altered harmonics, groove/microtiming, prosody, and long-range generative coherence**, the spectrogram-vision stack systematically leaves information on the table or fails outright. This is where the thesis bites.

So the defensible claim is not "spectrograms are a category error" but **"the field optimized its representations and objectives for the one task family (lexical recognition) that needs time least, and inherited a vision-shaped inductive bias that is mismatched to the task families that need time most."** That reframing is sharper, falsifiable, and survives the counter-evidence. I use it throughout.

---

## §1. Phase-aware representation

**The central distinction the literature blurs: *preserve* vs *generate* vs *use* phase.**

1. **Most "phase-aware" models *generate* phase for reconstruction; they do not *use* phase as input information.** Vocos (Siuzdak 2023, arXiv **2306.00814**) is the cleanest case: it predicts complex STFT coefficients via a "circular activation" — project network output to an angle `p`, emit `(cos p, sin p)` so `φ = atan2(sin p, cos p)` is automatically wrapped to (−π, π], sidestepping the phase-wrapping discontinuity that destabilized earlier complex-spectrogram GANs. But its **input is a mel-spectrogram — magnitude only.** Phase is an *output*, synthesized to make iSTFT reconstruction sound right (≈68× faster than BigVGAN on GPU, 424× on CPU, at PESQ/MOS parity). Same logic for explicit-phase neural codecs: APCodec (arXiv **2402.10533**), STFTCodec (arXiv **2503.16989**), and SpectroStream (arXiv **2508.05207** `[listing-only]`) carry parallel amplitude/phase branches — but the phase branch exists to *reconstruct*, not to *inform recognition*. Time-domain codecs (Encodec, DAC, SoundStream) model phase only *implicitly*, as a side effect of operating on the waveform.

2. **Where phase is deliberately *used* as information, it is strikingly discriminative — which indicts mainstream mel-spec recognition for discarding it.** The sharpest evidence is anti-spoofing: synthetic/converted speech corrupts phase structure that vocoders don't faithfully reproduce. Modified Relative Phase features cut synthetic-speech-detection equal error rate from **1.883% (MFCC) to 0.013%** (Wang et al., *Speech Communication*, "Synthetic speech detection using phase information," DOI 10.1016/j.specom.2016.07.001), and Modified Group Delay features outperform magnitude features for the same task. Discriminative speech enhancement also *uses* phase: complex-spectral-mapping models — Deep Complex U-Net (arXiv **1903.03107**), DCCRN (arXiv **2008.00264**) — take the noisy complex spectrum in and estimate the clean complex spectrum, jointly correcting magnitude *and* phase. But note even these are signal-restoration, not *understanding*.

3. **The contest, named.** Vocos itself concedes "the literature does not provide a definitive answer regarding the perceptual importance of phase." That is the honest state. The resolution is task-dependence (see §6, Saddler & McDermott): phase carries decisive information for localization and voice identity, near-zero usable information for lexical content in noise. **The gap for the thesis: there is essentially no self-supervised *representation-learning* model that ingests fine phase/temporal-fine-structure and is shown to selectively improve the phase-dependent task family.** Codecs reconstruct phase; enhancement corrects phase; anti-spoofing exploits phase — but no general audio encoder is built to *cognize* with it. (This is Experiment 1, §10.)

---

## §2. Multi-scale temporal architecture

**"Multi-scale" in audio SSMs is partly *achieved* inside a layer and mostly *assumed* across layers.**

1. **Single-layer SSMs already contain a *spread* of timescales — this is real, not assumed.** S4/Mamba initialize the discretization step Δ log-uniformly over (0.001, 0.1), and Δ has a literal interpretation as the dependency length the kernel captures ("How to Train Your HiPPO," Gu et al. 2022, arXiv **2206.12037**). Critically, learning **P distinct timescales (one per state dimension)** beats a single shared timescale, and initialization-scheme choice materially changes which correlations a model can represent ("Autocorrelation Matters," arXiv **2411.19455**; S5, Smith et al., ICLR 2023, OpenReview Ai8Hw3AXqks `[ID-unverified]`). So a single Mamba/S4 stack is *not* single-scale in the trivial sense — its HiPPO basis and Δ-spectrum span orders of magnitude by construction.

2. **But genuine *hierarchical* multi-resolution is rare and is dominated by one design: SaShiMi-style pooling tiers.** SaShiMi (Goel et al., ICML 2022, arXiv **2202.09729**) processes raw waveform at the top tier and downsampled signal at lower tiers, with a Hurwitz-matrix reparameterization to stabilize S4 under autoregressive generation. Mamba later improved on S4 *within* this same SaShiMi scaffold. Most subsequent "audio Mamba" work (e.g., Audio Mamba, arXiv **2405.13636**) is a **single-scale stack** — it inherits the intra-layer Δ-spread but adds no architectural multi-resolution. The much-cited "multi-scale SSM" framing (e.g., MS-SSM, arXiv **2512.23824** `[listing-only]`) is recent and largely unvalidated on audio.

3. **The time-constant problem, and where it's actually addressed.** The deepest attempt to make timescale *input-adaptive* is the Liquid line: Liquid Time-constant Networks (Hasani et al. 2020, arXiv **2006.04439**) and Liquid-S4 / "Liquid Structural State-Space Models" (Hasani et al. 2022, arXiv **2209.12951**), which make the state-transition kernel input-dependent — the effective time constant changes with the signal. Mamba's selectivity (input-dependent Δ, B, C; arXiv **2312.00752**) is the same idea in the now-dominant form. **The unexamined gap:** nobody has *measured*, on audio, whether a trained single-scale selective SSM's learned Δ-distribution actually covers the two scales a real task needs simultaneously (e.g., 10-ms microtiming *and* 30-s musical form), or whether it collapses to a narrow band and silently fails the other scale. "Multi-scale" is asserted from architecture, not verified from learned dynamics. (This is Experiment 3, §10.)

---

## §3. Predictive-coding training objectives in audio

**The field's "predictive" objectives quietly stopped being temporally *predictive*.**

1. **Forward prediction worked early, then was abandoned for masked infilling.** The genuinely forward-predictive objectives are CPC (van den Oord et al. 2018, arXiv **1807.03748**) — InfoNCE over *future* latents, which beat MFCC/filterbanks on ABX phone discrimination — and APC (autoregressive prediction of fbank features N steps ahead). Then the SOTA pivoted decisively to **masked, bidirectional infilling**: wav2vec 2.0 (contrastive over *masked* latents, arXiv **2006.11477**), HuBERT (masked prediction of clustered units, arXiv **2106.07447**), data2vec (masked latent regression, Baevski et al. 2022), and BEST-RQ (masked prediction of random-projection-quantized labels, arXiv **2202.01855**). A-JEPA (arXiv **2311.15830**) and Audio-JEPA (arXiv **2507.02915**) are JEPA *masking* on mel-patches — predict masked *representations*, not the future. **Masked infilling is interpolation; predictive coding in the Friston/Husserl "protention" sense is extrapolation.** The field uses the word "predictive" for the former.

2. **There is a real, recent revival of forward prediction — and it is the more thesis-relevant lineage.** NEST-RQ (arXiv **2409.08680**) does *next-token* prediction over BEST-RQ-style discrete speech tokens — explicitly causal/forward, motivated by streaming. This is the empirically live version of "time-native predictive coding," and it is under-studied relative to masked methods.

3. **The neural motivation is itself contested — say so.** The biological warrant for predictive objectives is hierarchical predictive coding in auditory cortex: mismatch-negativity and *omission* responses (response to an expected sound that fails to occur) fit predictive-coding models (Wacongne et al. 2012, *J. Neurosci.*, "A Neuronal Model of Predictive Coding Accounting for the Mismatch Negativity," PMC6703454). **But the adaptation/stimulus-specific-adaptation account remains a serious competitor** (PMC8640521; Distinguishing Neural Adaptation and Predictive Coding, PubMed 27752799). For *music*, the symbolic predictive-coding tradition is mature — IDyOM (Pearce 2005; *Topics in Cognitive Science* 2012, DOI 10.1111/j.1756-8765.2012.01214.x) models melodic expectation as variable-order Markov prediction and explains expectation, segmentation, and meter via information content/entropy — but it is symbolic, not acoustic. **The empirically open question (and a genuine gap): no clean head-to-head shows that a *forward*-predictive acoustic objective yields representations that encode temporal *direction/anticipation* better than masked infilling.** (Experiment 2, §10.)

---

## §4. Brain-aligned audio models — and the controversy, undiluted

1. **The positive result.** Tuckute, Feather, Boebinger & McDermott 2023 (*PLOS Biology*, DOI **10.1371/journal.pbio.3002366**; bioRxiv 2022.09.06.506680) tested many DNN audio models against fMRI auditory-cortex responses: most outpredicted a SpectroTemporal filterbank baseline, and showed **stage→region correspondence** (middle stages → primary AC, deep stages → non-primary). Training task mattered sharply: **speech-in-noise-trained models beat clean-speech models** (p < 0.001), and **multi-task models gave the best overall predictions**; pitch-selective cortex was best predicted by AudioSet-trained models. Pepino, Riera, Kamienkowski & Ferrer 2025 ("Better audio representations are more brain-like," arXiv **2511.16849**) extend this: across **36 models, 2 fMRI datasets, 6 HEAR tasks**, downstream task performance correlates with brain alignment at **r > 0.8** — "good models are brain-like," without optimizing for it.

2. **The critique — and the crucial audio-specific twist the brief's framing gets half-wrong.** The general "untrained-baseline" critique (architecture + a linear readout inflates neural-predictivity scores; even *untrained* nets predict brain data well) is robustly established **in language and vision** — e.g., a shallow *untrained* multi-head attention net predicts language cortex (arXiv **2406.15109**), and LM brain-predictivity is largely present after developmentally-tiny training (Hosseini, Schrimpf et al. 2024, *Neurobiology of Language*, MIT Press). **But for audio specifically, Tuckute's own permuted-weight controls *underperformed* both the trained models and the baseline** — task optimization was necessary, architecture alone was insufficient. So the "untrained baseline" critique, as applied to *audio*, is **weaker than the brief assumes** and is partly pre-rebutted within the very paper being cited.

3. **The strong audio-specific critique is metamers, not untrained baselines.** Feather, Leclerc, Madry & McDermott 2023 (*Nature Neuroscience* 26:2017–2034, DOI **10.1038/s41593-023-01442-0**) generate **model metamers** — stimuli matched in a model's late-stage activations — and find they are **unrecognizable to humans**, and *idiosyncratic per model* (one model's metamers are gibberish to another). This is the honest puncture: **high neural predictivity coexists with grossly divergent invariances.** Tuckute et al. concede the point directly — predictions remained "well below the noise ceiling," none of the models "fully account for" auditory cortex, and correlation "does not necessarily imply that the underlying features are the same." **Net verdict:** brain-aligned audio models are a real, improving phenomenon (and noise/multi-task training is a genuine, mechanism-suggestive finding), but predictivity is *not* evidence of shared computation, and the metamer divergence is unexplained.

---

## §5. Music as a temporal benchmark

1. **Why music is the right stress test — two scales at once.** Music demands *simultaneous* sensitivity to **sub-100-ms microtiming** (groove, swing, expressive deviation from the metrical grid) and **multi-minute form** (motif, section, return). Microtiming — "small-scale temporal deviations of events relative to an isochronous grid" (swing eighths, rubato) — is exactly the fine-temporal structure a magnitude-spectrogram frame-rate blurs. This is the cleanest natural task where the thesis is testable, because the *same signal* requires both scales (cf. §2's measurement gap).

2. **What benchmarks exist.** MARBLE (Yuan et al., NeurIPS 2023, arXiv **2306.10548**) standardizes **18 MIR tasks across 12 datasets** with MERT as a strong baseline — but it is dominated by *static-ish tagging/classification* (genre, key, instrument, pitch) and explicitly notes tagging and source separation are far from solved. Beat/downbeat tracking is mature on Western 4/4 ("Beat this!", Foscarin et al., ISMIR 2024, arXiv **2407.21658**; tempo "are we done yet?", *TISMIR* 10.5334/tismir.43). For long-range structure, Music Transformer (Huang et al. 2018, arXiv **1809.04281**) made relative attention generate minute-scale form, and recent work invents *Structure Coherence* metrics (MusicWeaver, arXiv **2509.21714** `[listing-only]`).

3. **The benchmarks that are missing — and this is the actionable gap.** (a) **No standard "two-scale simultaneous" benchmark** that scores a model on microtiming discrimination *and* long-range form on the same tracks. (b) **No groove/microtiming *understanding* benchmark** at scale — microtiming is studied in Afro-Latin/jazz corpora but not as a general representation probe. (c) **Long-range structural-coherence metrics are new and unvalidated against human judgment.** Music is the field's best available temporal-cognition microscope, and the field mostly points it at static tagging.

---

## §6. Biological frontends — engineering-useful or biology-fetishism?

**Honest verdict: mostly fetishism for *generic* tasks, but with one rigorous, recent, task-specific exception that matters.**

1. **The negative evidence is strong and should not be soft-pedaled.** Learnable frontends were sold as beating fixed mel: LEAF (Zeghidour et al. 2021, arXiv **2101.08596**) reported 76.9% vs 73.9% (mel) average accuracy. But the careful replication — EfficientLEAF, "A Faster LEarnable Audio Frontend of *Questionable Use*" (EUSIPCO 2022) — found that LEAF and its variants **fail to consistently beat a fixed mel filterbank across six classification tasks.** For mainstream tagging/recognition, biologically-elaborate or learnable frontends are, to first order, *not* worth it.

2. **The one rigorous pro-biology result — and it is task-specific, not blanket.** Saddler & McDermott 2024 (*Nature Communications*, "Models optimized for real-world tasks reveal the task-dependent necessity of precise temporal coding in hearing"; bioRxiv 2024.04.21.590435; PubMed 38712054; code `msaddler/phaselocknet`) trained networks on a *simulated-cochlea* front-end and varied auditory-nerve **phase-locking fidelity** (the sub-millisecond spike-timing precision). Result, stated precisely:
   - **Sound localization** — *requires* high-fidelity phase locking; models with it are substantially more human-like.
   - **Voice/speaker recognition** — *requires* phase locking, especially when pitch/harmonics are altered.
   - **Word recognition in real-world noise** — *does not* benefit; accuracy is stable across phase-locking conditions.
   This is the empirical backbone of the whole memo: **fine temporal coding is decisive for exactly the task family the spectrogram stack handles worst, and irrelevant for the one it handles best.** It reframes "biological frontend" from aesthetic to *task-conditional engineering choice*.

3. **The differentiable-cochlea tooling now exists, removing the old excuse.** CARFAC v2 in JAX (Lyon 2024, arXiv **2404.17490**) gives a fast, autodifferentiable human-cochlea model (with hearing-impairment parameterization); "Biomimetic Frontend for Differentiable Audio Processing" (arXiv **2409.08997**) packages cochlear processing as a trainable front-end. So the cost of *testing* biological frontends on the phase-dependent task family has dropped sharply — which is precisely why Experiment 1 is now cheap.

---

## §7. Active listening

**Confirmed sparse and fragmented. The capability exists in pieces; the integration with modern audio cognition is essentially absent.** (I ran targeted absence-confirming searches; see scratchpad.)

1. **It exists in robotics, decoupled from representation learning.** Head movement demonstrably improves localization and resolves front/back ambiguity: dynamic acoustic sensing in moving humanoids (IEEE 7179048), a Bayesian account of auditory selective attention via head rotation + ITD (PMC5629026), interactive auditory *object* exploration with a humanoid (arXiv **1807.01035**), and "Active Acoustic Sensing for Robot Manipulation" (arXiv **2308.01600**, emit-and-listen for material/contact). These treat sensing as motor control but use hand-built or task-specific features.

2. **It exists in LLM-agent form, at the wrong level of abstraction.** OmniAgent ("Active Perception Agent for Omnimodal Audio-Video," arXiv **2512.23646** `[listing-only]`) orchestrates tools to attend to audio cues — but this is high-level *tool routing*, not closed-loop control of *when/where/how* to sample the acoustic field.

3. **The hole.** There is **no system where an active-sampling policy (head/attention/gain as actions to reduce predictive uncertainty) is learned *jointly* with the audio representation** — the auditory analogue of foveated active vision. Given that §3's predictive objectives produce exactly the uncertainty signal an active policy would minimize, this is the most *structurally* time-native idea in the whole landscape and the least explored.

---

## §8. Cross-modal grounding

**Where cross-modal training improves *temporal* cognition specifically (not task performance broadly): the case is real but the demonstrated effect sizes are modest, and "temporal" gains are hard to disentangle from "more supervision."**

1. **Audio↔visual synchronization is the one pretext task that is *intrinsically* temporal.** Predicting whether audio and video are time-aligned forces the audio encoder to represent *onsets and fine timing*, because that is the only signal the task exposes: Owens & Efros 2018 (arXiv **1804.03641**), SyncNet/"Perfect Match" (arXiv **1809.08001**), CAV-MAE Sync (arXiv **2505.01237**). Notably, CrissCross (arXiv **2111.05329**) finds that *relaxing* strict synchronicity helps generalization — a caution that "maximize temporal alignment" is not monotonically good.

2. **Direct transfer evidence to a temporal task — and its honest size.** DOA-aware audio-visual SSL pretraining reduced sound-event-localization-and-detection error from **36.4 → 34.9** on DCASE2022 Task 3 (arXiv **2410.22803**). Real, measurable, *modest*. This is the most specific "cross-modal helps a temporal/spatial task" number I can verify; it is not a transformation.

3. **Audio↔motor is mostly human-neuroscience, not ML.** Sensorimotor synchronization shows stronger cortical entrainment at the beat frequency predicts better temporal prediction (*Sci. Rep.* 2025, 10.1038/s41598-025-93948-9), and rhythm perception is modeled as predictive coding (Frontiers Psychology 2014, "Rhythmic complexity and predictive coding"). **The ML opportunity is open:** an audio↔motor grounding objective (predict the movement that produced/accompanies the sound) would target *anticipatory* timing directly, and I find no scaled audio-representation work doing this. Verdict: cross-modal grounding *does* improve temporal cognition where the pretext is temporal (AV-sync), but the demonstrated gains are small and the most temporally-pointed modality (motor) is unexploited.

---

## §9. Open problems (genuinely unsolved)

1. **The invariance-divergence problem.** Models that best *predict* auditory cortex have invariances *grossly misaligned* with human perception (metamers, §4). No one knows what objective or architecture closes this gap, or whether high predictivity and human-like invariance are even simultaneously achievable with current encoders. This is unsolved, not rhetorical: Feather 2023 demonstrates the divergence; nothing demonstrates a fix.

2. **The two-scale binding problem.** No audio architecture is *shown* (by measuring learned dynamics, not asserting from design) to simultaneously represent sub-100-ms microtiming and multi-minute structure in one signal. SSMs *could* via timescale spread; whether trained ones *do* is unmeasured (§2, §5). Generative music models still lose long-range coherence — a symptom of the same unsolved problem.

3. **The objective-for-time problem.** We have no objective demonstrated to instill *temporal directionality / anticipation* as a represented property. Masked infilling is time-symmetric; the field abandoned forward prediction for engineering convenience (§3). Whether forward-predictive objectives produce measurably more time-native representations is open and, surprisingly, untested head-to-head.

4. **(Bonus) The active-sampling problem.** Perception-as-action is standard in vision and absent in audio representation learning (§7). Whether jointly learning a sampling policy + representation improves temporal cognition is entirely open.

---

## §10. Three high-leverage experiments (1–3 GPUs, weeks)

### Experiment 1 — Temporal-fine-structure frontend as a *task-selective* representation lever
*(tests the thesis directly; cheap now that CARFAC-JAX exists)*

- **Hypothesis.** A frontend that preserves phase-locked temporal fine structure (CARFAC-JAX cochleagram / auditory-nerve neurogram, arXiv 2404.17490) trained with a *fixed* SSL objective will **selectively** improve a phase-dependent task cluster (sound localization, speaker ID, pitch-under-altered-harmonics, groove/microtiming discrimination, emotion/prosody) **without** improving — and possibly slightly hurting (compute/throughput) — phonetic/word recognition, *relative to* a matched mel-spectrogram frontend. This is the representation-learning generalization of Saddler & McDermott's behavioral result (§6).
- **Design.** Same encoder (small Mamba or Conformer, <30M params), same SSL objective (BEST-RQ or A-JEPA), two frontends: (A) 80-bin mel, (B) CARFAC neurogram downsampled to matched token rate. Probe-only (frozen) evaluation on a battery split into "phase-dependent" vs "lexical" task groups. 1–2 GPUs, ~1–2 weeks.
- **Falsifies the thesis** if mel matches/beats CARFAC on the phase-dependent cluster, or if CARFAC improves *uniformly* (implying a generic, not time-native, advantage).
- **Confirms** if the *interaction* is significant: frontend × task-group, with CARFAC winning the phase cluster only. A significant interaction is the cleanest possible evidence that "time-to-space" is lossy *exactly where the thesis claims.*

### Experiment 2 — Arrow-of-time probe: does *forward* prediction encode temporal direction that masking does not? *(the non-obvious one)*

- **Hypothesis.** Representations from a *forward*-predictive objective (CPC-style / NEST-RQ-style next-token, arXiv 2409.08680) encode **temporal directionality** — and therefore support **time-reversal detection** and **next-event anticipation** — measurably better than representations from a *time-symmetric* masked objective (A-JEPA / BEST-RQ) of identical architecture, data, and compute. Masked reps may still win on static classification.
- **Why non-obvious.** The diagnostic is an **"arrow-of-time" classifier**: real vs time-reversed audio. Time-reversal **preserves the magnitude spectrogram's marginal statistics** but flips causal temporal structure; a frozen linear probe's accuracy on this task isolates *temporal-directionality content* from spectral content. Mel-spec/masked models should sit near chance on the *representation-level* probe; forward-predictive models should not. Pair with a music *anticipation* probe (predict next chord/beat) for ecological validity.
- **Design.** Two pretraining runs, matched in every respect except objective directionality; frozen-probe evaluation on (a) arrow-of-time, (b) musical next-event, (c) a static control (genre/instrument tagging, where masking is expected to win or tie). 2–3 GPUs, ~2–3 weeks.
- **Falsifies** the "forward prediction is more time-native" hypothesis if both objectives reach equal arrow-of-time/anticipation accuracy (i.e., masking already captures direction), or if neither beats chance (i.e., the probe is uninformative — run a supervised topline to rule this out).
- **Confirms** if forward > masked on (a)+(b) while masked ≥ forward on (c) — a *double dissociation* that would be the first clean evidence that objective directionality, not just architecture, governs time-native representation.

### Experiment 3 — Is multi-scale *achieved* or *assumed*? Measure the learned timescale spectrum
*(turns §2's rhetorical worry into a measurement)*

- **Hypothesis.** A *single-scale* selective SSM (one Mamba stack) trained on a task requiring **both** fine (microtiming) and coarse (sectional form) sensitivity will exhibit a learned Δ / effective-receptive-field distribution that **collapses toward one band** and underperforms on the neglected scale, whereas an explicit multi-tier SaShiMi-style model (or a multi-Δ-initialized SSM) will cover both.
- **Design.** Construct/repurpose a music task with paired labels at two scales on the same tracks: (i) microtiming/swing-ratio regression (fine), (ii) section-boundary / structural-repetition detection (coarse). Train (A) single-scale Mamba, (B) SaShiMi multi-tier, (C) Mamba with enforced wide multi-Δ initialization. **Key, rarely-done measurement:** probe each layer's *empirical* impulse response / effective receptive field and plot the learned timescale histogram. 1–2 GPUs, ~2 weeks.
- **Falsifies** the "multi-scale is merely assumed" worry if the single-scale model's learned Δ-spectrum already spans both scales *and* it matches the multi-tier model on both task heads (i.e., intra-layer spread suffices — a genuinely useful negative result).
- **Confirms** if single-scale shows band-collapse + a per-scale performance deficit that the multi-tier/wide-Δ models repair — demonstrating that current "audio Mamba" practice silently under-serves one temporal scale, and that the fix is architectural, not incidental.

---

## Citation reliability ledger

- **Fetched in full this session:** Vocos (2306.00814); Tuckute 2023 (PLOS Biol, via PMC10718467); Pepino 2025 (2511.16849); Saddler & McDermott 2024 (PubMed 38712054). Quoted numbers/directions are from these reads.
- **Confirmed via source's own abstract page this session:** CPC 1807.03748; A-JEPA 2311.15830; Audio-JEPA 2507.02915; DCUnet 1903.03107; DCCRN 2008.00264; SaShiMi 2202.09729; Feather 2023 (10.1038/s41593-023-01442-0); MARBLE 2306.10548; APCodec 2402.10533; STFTCodec 2503.16989; wav2vec2 2006.11477; HuBERT 2106.07447; BEST-RQ 2202.01855; NEST-RQ 2409.08680; LEAF 2101.08596; Liquid-S4 2209.12951; LTC 2006.04439; HiPPO 2206.12037; "Autocorrelation Matters" 2411.19455; Mamba 2312.00752; Audio Mamba 2405.13636; Music Transformer 1809.04281; "Beat this!" 2407.21658; CARFAC v2 2404.17490; Biomimetic Frontend 2409.08997; "Deep Generative Models of Music Expectation" 2310.03500; Owens&Efros 1804.03641; Perfect Match 1809.08001; CAV-MAE Sync 2505.01237; CrissCross 2111.05329; DOA-aware AV-SSL 2410.22803; Wacongne 2012 (PMC6703454); adaptation challenge (PMC8640521, PubMed 27752799); active-listening robotics (1807.01035, 2308.01600, PMC5629026); IDyOM (Pearce, 10.1111/j.1756-8765.2012.01214.x).
- **`[listing-only]` — title/ID seen in search index, *not* independently read; do not lean on specific quantitative claims:** SpectroStream 2508.05207; MS-SSM 2512.23824; MusicWeaver 2509.21714; OmniAgent 2512.23646.
- **`[ID-unverified]` — cited by author/year/venue; numeric identifier not re-confirmed, deliberately not guessed:** data2vec (Baevski et al. 2022); S5 (Smith et al., ICLR 2023, OpenReview Ai8Hw3AXqks).
- **No fabricated citations.** Where I could not verify, I marked it rather than inventing an ID. The modified-relative-phase EER figures (1.883% → 0.013%) come from the *Speech Communication* phase-detection literature surfaced in search; the specific paper is Wang et al., DOI 10.1016/j.specom.2016.07.001 — `[DOI inferred from venue, not fetched]`.
