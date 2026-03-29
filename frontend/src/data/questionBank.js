/**
 * VTU Question Bank — 10 subjects, 5 questions each (50 total)
 * All based on official VTU 2021 scheme syllabus
 */
const QUESTION_BANK = {
  '21MAT31': [
    { q:'The Laplace transform of e^(at) is:', o:['1/(s+a)','1/(s-a)','s/(s-a)','a/(s²+a²)'], a:1, e:'L{e^(at)} = 1/(s-a), valid for s > a.' },
    { q:'The inverse Laplace transform of 1/s² is:', o:['1','t','e^t','δ(t)'], a:1, e:'L{t} = 1/s², so L⁻¹{1/s²} = t.' },
    { q:'Z-transform of unit step u(n) is:', o:['z/(z-1)','1/(z-1)','z/(z+1)','1/z'], a:0, e:'Z{u(n)} = z/(z-1) for |z| > 1.' },
    { q:'An even function satisfies:', o:['f(-x) = -f(x)','f(-x) = f(x)','f(x) = f(x+T)','f(x+T) = -f(x)'], a:1, e:'Even function: f(-x) = f(x) — symmetric about the y-axis.' },
    { q:'Fourier series of a periodic function with period 2π contains:', o:['Only sine terms','Only cosine terms','Both sine and cosine terms','Neither'], a:2, e:'General Fourier series has a₀ + Σaₙcos(nx) + Σbₙsin(nx) — both sine and cosine terms.' },
  ],
  '21PHY12': [
    { q:'Diffraction confirms the __ nature of light:', o:['Particle','Wave','Quantum','Electromagnetic only'], a:1, e:'Diffraction (bending around obstacles) is exclusively a wave phenomenon.' },
    { q:'Heisenberg\'s uncertainty principle: Δx·Δp ≥', o:['ℏ','ℏ/2','h','h/4π'], a:1, e:'Δx·Δp ≥ ℏ/2 where ℏ = h/2π.' },
    { q:'Superconductivity is characterized by:', o:['Infinite resistance','Zero resistance + Meissner effect','High thermal conductivity','Negative permittivity'], a:1, e:'Zero electrical resistance AND expulsion of magnetic fields (Meissner effect).' },
    { q:'In a laser, population inversion means:', o:['More atoms in ground state','Equal populations','More atoms in excited state','No excited atoms'], a:2, e:'Population inversion: N₂ > N₁ — required for stimulated emission to dominate absorption.' },
    { q:'Numerical aperture of an optical fibre determines its:', o:['Core diameter','Light gathering capacity','Cladding thickness','Operating wavelength'], a:1, e:'NA = sin(θ_max) — higher NA means the fibre accepts light over a wider cone of angles.' },
  ],
  '21CS31': [
    { q:'Time complexity of binary search:', o:['O(n)','O(log n)','O(n²)','O(1)'], a:1, e:'Binary search halves the search space each step: O(log n).' },
    { q:'Which structure uses LIFO?', o:['Queue','Stack','Deque','Priority Queue'], a:1, e:'Stack: Last In, First Out.' },
    { q:'Dijkstra\'s algorithm finds:', o:['Minimum spanning tree','Single-source shortest paths','All-pairs shortest paths','Topological order'], a:1, e:'Dijkstra: single-source shortest paths on graphs with non-negative weights.' },
    { q:'Merge Sort worst-case complexity is:', o:['O(n)','O(n log n)','O(n²)','O(log n)'], a:1, e:'Merge Sort is always O(n log n) — best, average and worst case.' },
    { q:'A complete binary tree with n nodes has height approximately:', o:['O(n)','O(log n)','O(n²)','O(√n)'], a:1, e:'Height = ⌊log₂ n⌋ = O(log n).' },
  ],
  '21CS32': [
    { q:'INNER JOIN returns:', o:['All rows from left table','All rows from both tables','Only matching rows','Unmatched rows'], a:2, e:'INNER JOIN — only rows where the join condition matches in both tables.' },
    { q:'3NF eliminates:', o:['Partial dependency','Transitive dependency','Multi-valued dependency','Join dependency'], a:1, e:'3NF: non-key attributes must depend only on the primary key, not on other non-key attributes.' },
    { q:'ACID — what does "I" stand for?', o:['Integrity','Isolation','Indexing','Identification'], a:1, e:'ACID: Atomicity, Consistency, Isolation, Durability.' },
    { q:'B+ Trees are preferred for database indexing because:', o:['They use less space','They support range queries efficiently','They are simpler than B-trees','All keys are in internal nodes'], a:1, e:'B+ Trees have all data in leaf nodes linked sequentially — ideal for range queries.' },
    { q:'DROP TABLE differs from TRUNCATE in that DROP:', o:['Removes only data','Removes structure too','Is slower','Cannot be rolled back unlike TRUNCATE'], a:1, e:'DROP TABLE removes both data and table structure. TRUNCATE removes only data, preserving structure.' },
  ],
  '21CS33': [
    { q:'SJF scheduling minimises:', o:['Context switches','Average waiting time','CPU utilisation','Turnaround time for long jobs'], a:1, e:'SJF is proven optimal for minimising average waiting time.' },
    { q:'Deadlock prevention removes which condition?', o:['At least one of the four Coffman conditions','Only circular wait','Only mutual exclusion','Only hold-and-wait'], a:0, e:'Preventing ANY one of mutual exclusion, hold-and-wait, no preemption, or circular wait prevents deadlock.' },
    { q:'FIFO page replacement can suffer from:', o:['Thrashing','Belady\'s anomaly','Fragmentation','None'], a:1, e:'Belady\'s anomaly: FIFO can have more page faults with more frames — a counterintuitive result.' },
    { q:'A semaphore with initial value 1 is a:', o:['Counting semaphore','Binary semaphore / mutex','Spinlock','Monitor'], a:1, e:'A semaphore initialised to 1 acts as a mutex — only one process in the critical section.' },
    { q:'Thrashing occurs when:', o:['CPU utilisation is high','Processes spend more time paging than executing','Memory is sufficient','There is no deadlock'], a:1, e:'Thrashing: the OS spends most time swapping pages, leaving little time for actual computation.' },
  ],
  '21CS34': [
    { q:'-5 in 8-bit 2\'s complement is:', o:['11111011','11111010','10000101','11111100'], a:0, e:'+5 = 00000101 → invert = 11111010 → +1 = 11111011.' },
    { q:'NAND gate is universal because:', o:['It is the cheapest','Any Boolean function can be built from it','It has the least propagation delay','It is the simplest'], a:1, e:'NAND (and NOR) are functionally complete — AND, OR, NOT can all be derived from NAND.' },
    { q:'Immediate addressing mode means:', o:['Operand is in a register','Operand is in memory','Operand is in the instruction itself','Operand address is in memory'], a:2, e:'Immediate: data is part of the instruction, e.g., MOV R1, #10.' },
    { q:'Cache exploits:', o:['Spatial locality only','Temporal locality only','Both spatial and temporal locality','Random access patterns'], a:2, e:'Temporal: recently used items used again. Spatial: nearby data used next. Cache exploits both.' },
    { q:'Pipelining improves:', o:['Latency of one instruction','Throughput','Cache size','Branch prediction accuracy'], a:1, e:'Pipelining overlaps instruction execution — throughput (instructions per unit time) improves.' },
  ],
  '21EC41': [
    { q:'Bandwidth of an AM signal with message frequency fm:', o:['fm','2fm','fm/2','4fm'], a:1, e:'AM has upper and lower sidebands: BW = 2fm.' },
    { q:'Nyquist sampling rate for a signal of bandwidth B is:', o:['B','B/2','2B','4B'], a:2, e:'Nyquist theorem: must sample at ≥ 2×highest frequency to avoid aliasing.' },
    { q:'In PCM, quantization noise decreases when:', o:['Sampling rate decreases','Number of bits per sample increases','Message amplitude increases','Bandwidth decreases'], a:1, e:'More bits = more quantization levels = less quantization error. SNR ≈ 6.02n + 1.76 dB.' },
    { q:'FM is more noise-immune than AM because:', o:['FM has higher carrier frequency','FM uses constant amplitude','FM uses less bandwidth','FM is digital'], a:1, e:'FM: information is in frequency, not amplitude — amplitude noise doesn\'t affect demodulation.' },
    { q:'CDMA assigns unique __ to each user:', o:['Time slots','Frequency bands','Spreading codes','Amplitude levels'], a:2, e:'CDMA: all users share same time/frequency; each user has a unique orthogonal code.' },
  ],
  '21ME32': [
    { q:'First law of thermodynamics states:', o:['Entropy always increases','Energy is conserved','Heat flows hot to cold','Absolute zero is unattainable'], a:1, e:'First law: Q = ΔU + W — energy added as heat equals change in internal energy plus work done.' },
    { q:'Carnot efficiency = 1 - T₂/T₁ where T₁ is:', o:['Cold reservoir','Hot reservoir','Ambient temperature','Average temperature'], a:1, e:'η_Carnot = 1 - T_cold/T_hot = 1 - T₂/T₁ where T₁ is the hot source temperature.' },
    { q:'Young\'s modulus E = :', o:['Stress × Strain','Stress / Strain','Strain / Stress','Force × Elongation'], a:1, e:'E = σ/ε = (F/A)/(ΔL/L) — stiffness of material.' },
    { q:'Bernoulli\'s equation applies to:', o:['Compressible viscous flow','Incompressible inviscid flow','Any fluid flow','Only gases'], a:1, e:'Bernoulli: incompressible (ρ = const), inviscid (no friction), steady flow along a streamline.' },
    { q:'The SFD (Shear Force Diagram) is zero at:', o:['Supports only','Points of maximum bending moment','Free ends','Mid-span always'], a:1, e:'Maximum bending moment occurs where shear force = 0 (where the SFD crosses zero).' },
  ],
  '21EE41': [
    { q:'Torque of a DC motor is proportional to:', o:['Voltage only','Speed','Flux × Armature current','1/Speed'], a:2, e:'T = Kφ × Ia — torque is proportional to field flux and armature current.' },
    { q:'Transformer voltage ratio = N₁/N₂ =', o:['V₁/V₂','V₂/V₁','I₁/I₂','P₁/P₂'], a:0, e:'V₁/V₂ = N₁/N₂ (voltage ratio = turns ratio). Note: current ratio is inverse.' },
    { q:'Power factor = :', o:['Reactive/Apparent','Real/Reactive','Real/Apparent','Apparent/Real'], a:2, e:'PF = P/S = cos θ — ratio of real power to apparent power.' },
    { q:'Synchronous speed of a 4-pole, 50 Hz motor (RPM):', o:['3000','1500','1000','750'], a:1, e:'Ns = 120f/P = 120×50/4 = 1500 RPM.' },
    { q:'A 3-phase induction motor is self-starting because:', o:['It uses DC excitation','Rotating magnetic field is produced','Rotor has permanent magnets','It runs at synchronous speed'], a:1, e:'3-phase windings create a rotating magnetic field that induces currents in the rotor, causing torque.' },
  ],
  '21CV31': [
    { q:'Young\'s modulus E measures:', o:['Yield strength','Stiffness','Ductility','Hardness'], a:1, e:'E = σ/ε — stiffness: how much stress is needed per unit strain.' },
    { q:'In RCC, steel resists __ primarily:', o:['Compression','Tension','Both equally','Shear only'], a:1, e:'Concrete handles compression; steel (rebar) handles tension — RCC combines both.' },
    { q:'Critical path in CPM has:', o:['Maximum float','Minimum float (zero)','Maximum duration activities','Minimum cost'], a:1, e:'Critical path has zero total float — delays directly extend project duration.' },
    { q:'Safe drinking water pH range per BIS:', o:['2–4','5–6','6.5–8.5','9–11'], a:2, e:'BIS/WHO standard for drinking water: pH 6.5–8.5.' },
    { q:'Bearing capacity of soil is directly measured by:', o:['Atterberg limits test','Sieve analysis','Plate load test','Proctor test'], a:2, e:'Plate load test: applies load on a plate and measures settlement — directly gives bearing capacity.' },
  ],
};

export default QUESTION_BANK;
