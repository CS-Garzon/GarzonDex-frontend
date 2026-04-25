import React, { useState, useEffect } from 'react';

function App() {

  const [pokemonList, setPokemonList] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', height: '', weight: '',
    base_experience: '', abilities: '', hp: '', attack: '', defense: '', image: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pokemon');
      const data = await res.json();
      setPokemonList(data);
    } catch (error) {
      console.error("Error loading data", error);
    }
  };

  // Runs fetchData once when the component first loads
  useEffect(() => { fetchData(); }, []);

  // Closes the details modal and clears the selected Pokemon
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  // Moves to the previous (-1) or next (+1) Pokemon in the list
  const navigatePokemon = (direction) => {
    const currentIndex = pokemonList.findIndex(p => p.id === selectedPokemon.id);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < pokemonList.length) {
      setSelectedPokemon(pokemonList[nextIndex]);
    }
  };

  const handleCardClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5000/api/pokemon/${editingId}`
      : 'http://localhost:5000/api/pokemon';

    const payload = {
      ...formData,
      isCustom: true,
      height: Number(formData.height),
      weight: Number(formData.weight),
      base_experience: Number(formData.base_experience),
      stats: [
        { stat: { name: 'hp' }, base_stat: Number(formData.hp) },
        { stat: { name: 'attack' }, base_stat: Number(formData.attack) },
        { stat: { name: 'defense' }, base_stat: Number(formData.defense) }
      ],
      abilities: formData.abilities.split(',').map(a => ({ ability: { name: a.trim() } })),
      sprites: { front_default: formData.image || 'https://placehold.co/100x100?text=Custom' }
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setEditingId(null);
    setIsFormOpen(false);
    setFormData({
      name: '', description: '', height: '', weight: '',
      base_experience: '', abilities: '', hp: '', attack: '', defense: '', image: ''
    });
    fetchData();
  };

  const startEdit = (pokemon) => {
    setEditingId(pokemon.id);
    setFormData({
      name: pokemon.name,
      description: pokemon.description,
      height: pokemon.height,
      weight: pokemon.weight,
      base_experience: pokemon.base_experience,
      abilities: pokemon.abilities.map(a => a.ability.name).join(', '),
      hp: pokemon.stats[0].base_stat,
      attack: pokemon.stats[1].base_stat,
      defense: pokemon.stats[2].base_stat,
      image: pokemon.sprites.front_default
    });
    setIsFormOpen(true);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this Pokemon?")) {
      await fetch(`http://localhost:5000/api/pokemon/${id}`, { method: 'DELETE' });
      closeModal();
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black tracking-wider">GARZON'S POKEDEX</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', description: '', height: '', weight: '', base_experience: '', abilities: '', hp: '', attack: '', defense: '', image: '' });
              setIsFormOpen(true);
            }}
            className="bg-[#5865f2] hover:bg-[#4752c4] px-4 py-2 rounded font-bold transition-colors"
          >
            + ADD CUSTOM
          </button>
        </div>

        {/* Pokemon Grid - maps each Pokemon in the list to a card div */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {pokemonList.map(p => (
            <div
              key={p.id}
              onClick={() => handleCardClick(p)}
              className={`bg-[#1a1a1e] p-4 rounded cursor-pointer text-center transition-all
                ${p.isCustom
                  ? 'border-2 border-dashed border-[#5865f2]'
                  : 'border border-zinc-800 hover:border-[#5865f2]'}`}
            >
              <img
                src={p.isCustom
                  ? p.sprites.front_default
                  : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                alt={p.name}
                className="w-24 h-24 mx-auto object-contain"
              />
              <p className="font-bold capitalize mt-2">
                {p.name}{p.isCustom ? ' (Custom)' : ''}
              </p>
            </div>
          ))}
        </div>

        {/* CREATE/EDIT FORM MODAL - only renders when isFormOpen is true */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
            <form onSubmit={handleFormSubmit} className="bg-[#1a1a1e] p-6 rounded-lg border border-zinc-800 max-w-md w-full grid grid-cols-2 gap-3">
              <h2 className="col-span-2 text-xl font-bold mb-2">{editingId ? 'Edit' : 'Create'} Pokemon</h2>
              <input
                className="col-span-2 bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <textarea
                className="col-span-2 bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <input
                className="bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Height"
                type="number"
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
              />
              <input
                className="bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Weight"
                type="number"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
              />
              <input
                className="col-span-2 bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Base Experience"
                type="number"
                value={formData.base_experience}
                onChange={e => setFormData({ ...formData, base_experience: e.target.value })}
              />
              <input
                className="col-span-2 bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Abilities (comma separated)"
                value={formData.abilities}
                onChange={e => setFormData({ ...formData, abilities: e.target.value })}
              />
              <input
                className="bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="HP"
                type="number"
                value={formData.hp}
                onChange={e => setFormData({ ...formData, hp: e.target.value })}
              />
              <input
                className="bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Attack"
                type="number"
                value={formData.attack}
                onChange={e => setFormData({ ...formData, attack: e.target.value })}
              />
              <input
                className="col-span-2 bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Defense"
                type="number"
                value={formData.defense}
                onChange={e => setFormData({ ...formData, defense: e.target.value })}
              />
              <input
                className="col-span-2 bg-zinc-900 p-2 rounded border border-zinc-700"
                placeholder="Image URL (optional)"
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
              />
              <button type="submit" className="col-span-2 bg-green-600 hover:bg-green-700 p-2 rounded font-bold">
                SAVE POKEMON
              </button>
              <button
                type="button"
                onClick={() => { setIsFormOpen(false); setEditingId(null); }}
                className="col-span-2 text-zinc-500 hover:text-white"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* DETAILS MODAL - only renders when isModalOpen is true and a Pokemon is selected */}
        {isModalOpen && selectedPokemon && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-[#1a1a1e] border border-zinc-800 rounded-lg max-w-3xl w-full p-6 relative shadow-2xl flex flex-col md:flex-row gap-8">

              {/* Close Button */}
              <button onClick={closeModal} className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold">X</button>

              {/* Left Arrow */}
              <button
                onClick={() => navigatePokemon(-1)}
                disabled={pokemonList.findIndex(p => p.id === selectedPokemon.id) === 0}
                className="absolute left-[-50px] top-1/2 -translate-y-1/2 text-white text-6xl font-black hover:text-[#5865f2] disabled:opacity-20 transition-colors"
              >
                ‹
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => navigatePokemon(1)}
                disabled={pokemonList.findIndex(p => p.id === selectedPokemon.id) === pokemonList.length - 1}
                className="absolute right-[-50px] top-1/2 -translate-y-1/2 text-white text-6xl font-black hover:text-[#5865f2] disabled:opacity-20 transition-colors"
              >
                ›
              </button>

              {/* Left Side - Sprite & Basic Info */}
              <div className="flex flex-col items-center md:w-1/3 bg-[#121214] p-4 rounded-md border border-zinc-800">
                <img
                  src={selectedPokemon.sprites.front_default}
                  alt={selectedPokemon.name}
                  className="w-32 h-32 object-contain mb-2"
                />
                <h2 className="text-3xl font-black text-white capitalize mb-4">{selectedPokemon.name}</h2>
                <div className="w-full space-y-2 text-sm border-t border-zinc-800 pt-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-bold text-[10px]">Height</span>
                    <span>{selectedPokemon.height / 10}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-bold text-[10px]">Weight</span>
                    <span>{selectedPokemon.weight / 10}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-bold text-[10px]">Base Exp</span>
                    <span className="text-[#5865f2] font-bold">{selectedPokemon.base_experience}</span>
                  </div>
                </div>
                {selectedPokemon.cries && (
                  <div className="w-full mt-6">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Pokemon Cry</p>
                    <audio controls className="w-full h-8 scale-90" src={selectedPokemon.cries.latest}></audio>
                  </div>
                )}
              </div>

              {/* Right Side - Description, Abilities, Stats, Actions */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Description</h3>
                  <p className="text-zinc-300 italic text-sm leading-relaxed bg-zinc-900/50 p-3 rounded border border-zinc-800">
                    "{selectedPokemon.description}"
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Abilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPokemon.abilities.map((a, i) => (
                      <span key={i} className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded border border-zinc-700 uppercase font-bold">
                        {a.ability.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2">Base Stats</h3>
                  <div className="space-y-3">
                    {selectedPokemon.stats.map((s, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase font-bold">
                          <span className="text-zinc-400">{s.stat.name}</span>
                          <span className="text-white">{s.base_stat}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#5865f2] h-full transition-all duration-500"
                            style={{ width: `${Math.min((s.base_stat / 255) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit & Delete Buttons */}
                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => startEdit(selectedPokemon)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded font-bold text-sm"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(selectedPokemon.id)}
                    className="flex-1 bg-red-900/50 hover:bg-red-800 text-red-200 py-2 rounded font-bold text-sm border border-red-800"
                  >
                    DELETE
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;