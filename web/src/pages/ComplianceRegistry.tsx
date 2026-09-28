import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ClipboardList, Plus, Search, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const ComplianceRegistry: React.FC = () => {
  const [obligations, setObligations] = useState<any[]>([]);
  const [mines, setMines] = useState<any[]>([]);
  const [selectedMine, setSelectedMine] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Form state
  const [newTitle, setNewTitle] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newCat, setNewCat] = useState('SAFETY');
  const [newFreq, setNewFreq] = useState('MONTHLY');
  const [newMine, setNewMine] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newOwner, setNewOwner] = useState('Safety Manager');

  useEffect(() => {
    fetchMines();
    fetchObligations();
  }, [selectedMine, selectedCategory]);

  const fetchMines = async () => {
    try {
      const res = await api.get('/mines');
      setMines(res.data);
      if (res.data.length > 0 && !newMine) {
        setNewMine(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load mines:', err);
    }
  };

  const fetchObligations = async () => {
    try {
      let url = '/compliance/obligations?';
      if (selectedMine) url += `mine_id=${selectedMine}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      const res = await api.get(url);
      setObligations(res.data);
    } catch (err) {
      console.error('Failed to load obligations:', err);
    }
  };

  const handleAddObligation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/compliance/obligations', {
        mine_id: newMine,
        title: newTitle,
        statutory_ref: newRef,
        category: newCat,
        frequency: newFreq,
        due_date: new Date(newDueDate).toISOString(),
        assigned_owner: newOwner
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewRef('');
      fetchObligations();
    } catch (err) {
      console.error('Failed to add obligation:', err);
    }
  };

  const filteredObligations = obligations.filter(o =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.statutory_ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-amber-500" />
            <span>Statutory Compliance Registry</span>
          </h1>
          <p className="text-xs text-slate-400">Master database of statutory obligations mapped under Mines Act, DGMS Circulars, and CPCB rules</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-amber-500/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add Obligation</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search obligations or statutory reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedMine}
            onChange={(e) => setSelectedMine(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
          >
            <option value="">All Mines</option>
            {mines.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
          >
            <option value="">All Categories</option>
            <option value="SAFETY">Safety</option>
            <option value="ENVIRONMENT">Environment</option>
            <option value="PRODUCTION">Production</option>
            <option value="LABOUR">Labour</option>
          </select>
        </div>
      </div>

      {/* Obligations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Title & Summary</th>
                <th className="p-3">Statutory Ref</th>
                <th className="p-3">Category</th>
                <th className="p-3">Frequency</th>
                <th className="p-3">Assigned Owner</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredObligations.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3 font-medium text-white max-w-sm">
                    {o.title}
                  </td>
                  <td className="p-3 font-mono text-amber-400">{o.statutory_ref}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                      {o.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{o.frequency}</td>
                  <td className="p-3 text-slate-300">{o.assigned_owner}</td>
                  <td className="p-3 font-mono text-slate-400">{new Date(o.due_date).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      o.status === 'COMPLIANT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Create New Statutory Obligation</h2>
            <form onSubmit={handleAddObligation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Mine Selection</label>
                <select value={newMine} onChange={(e) => setNewMine(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded outline-none">
                  {mines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Obligation Title</label>
                <input required type="text" placeholder="e.g. Haul Road Dust Suppression Audit" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded outline-none" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Statutory Reference</label>
                <input required type="text" placeholder="e.g. DGMS Safety Circular 4/2021" value={newRef} onChange={(e) => setNewRef(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded outline-none">
                    <option value="SAFETY">SAFETY</option>
                    <option value="ENVIRONMENT">ENVIRONMENT</option>
                    <option value="PRODUCTION">PRODUCTION</option>
                    <option value="LABOUR">LABOUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Frequency</label>
                  <select value={newFreq} onChange={(e) => setNewFreq(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded outline-none">
                    <option value="DAILY">DAILY</option>
                    <option value="WEEKLY">WEEKLY</option>
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="QUARTERLY">QUARTERLY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Due Date</label>
                <input required type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded outline-none" />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-600">Save Obligation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
