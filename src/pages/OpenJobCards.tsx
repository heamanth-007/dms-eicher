import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  UserPlus, 
  MoreVertical, 
  ClipboardList, 
  UserCheck, 
  Wrench, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle
} from 'lucide-react';

interface OpenJobCardsProps {
  onBack: () => void;
  onNewJobCard: () => void;
  onViewJcDetails: (jc: any) => void;
  onEditJc: (jc: any) => void;
  searchTerm: string;
  jobCards?: any[];
  onHandoffComplete?: () => void;
}


export const OpenJobCards: React.FC<OpenJobCardsProps> = ({ 
  onBack, 
  onNewJobCard,
  onViewJcDetails,
  searchTerm,
  jobCards: propJobCards
}) => {
  const [showTable, setShowTable] = useState(true);
  const [addingPartsJc, setAddingPartsJc] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState('');
  const [partQty, setPartQty] = useState(1);

  // Quick Billing State
  const [completingJc, setCompletingJc] = useState<any>(null);
  const [labourAmount, setLabourAmount] = useState<number>(0);
  const [partsAmount, setPartsAmount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Edit State
  const [editingJc, setEditingJc] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<string>('');

  // Assign Mechanic Modal State
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [assigningJc, setAssigningJc] = useState<any>(null);
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string>('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  React.useEffect(() => {
    fetch(`${API_URL}/api/parts`)
      .then(res => res.json())
      .then(data => setParts(data))
      .catch(err => console.error(err));

    fetch(`${API_URL}/api/mechanics`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMechanics(data); })
      .catch(err => console.error(err));
  }, [API_URL]);

  const handleConfirmAssignment = () => {
    if (!assigningJc || !selectedMechanicId) {
      alert('Please select a mechanic.');
      return;
    }
    const mech = mechanics.find(m => m.id === selectedMechanicId);
    if (!mech) return;

    const jcNo = assigningJc.jcNumber || assigningJc.rawJc?.jcNumber;

    fetch(`${API_URL}/api/jobcards/${jcNo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ASSIGNED',
        mechanicName: mech.name,
        mechanicInitials: mech.initials || mech.name.slice(0, 2).toUpperCase(),
        expectedDelivery: expectedDeliveryDate || 'Today, 05:00 PM'
      })
    })
      .then(() => fetch(`${API_URL}/api/mechanics/${selectedMechanicId}/assign-job`, { method: 'PUT' }))
      .then(() => {
        setToastMsg(`Job Card ${jcNo} successfully assigned to Mechanic ${mech.name}!`);
        setAssigningJc(null);
        setSelectedMechanicId('');
        setExpectedDeliveryDate('');
        setAssignmentNotes('');
        if (onHandoffComplete) onHandoffComplete();
        setTimeout(() => setToastMsg(''), 5000);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to assign mechanic.');
      });
  };

  const getActiveJobCards = () => {
    if (propJobCards && propJobCards.length > 0) {
      return propJobCards.filter(jc => jc.status !== 'COMPLETED').map(jc => ({
        jcNumber: jc.jcNumber,
        customerName: jc.customerName,
        vehicleModel: jc.vehicleModel,
        vehicleReg: jc.vehicleReg,
        engineNo: jc.engineNo || 'E494TCIC',
        chassisNo: jc.chassisNo || '881294',
        complaint: jc.complaintSummary,
        mechanicName: jc.mechanicName || 'Unassigned',
        mechanicInitials: jc.mechanicInitials || 'UN',
        mechanicStatus: jc.mechanicName ? ('assigned' as const) : ('unassigned' as const),
        dateIn: new Date(jc.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        status: (jc.status === 'WAITING PARTS' ? 'Waiting Parts' : jc.status === 'ASSIGNED' ? 'Assigned' : (jc.status === 'WAITING TO ASSIGN' || jc.status === 'OPEN' || jc.status === 'OPENING' || jc.status === 'UNASSIGNED' || !jc.mechanicName || jc.mechanicName === 'Unassigned') ? 'Waiting to Assign' : 'Working') as any,
        statusColor: jc.status === 'WAITING PARTS' ? 'bg-red-50 text-red-500 border-red-100' : jc.status === 'ASSIGNED' ? 'bg-blue-50 text-[#184edb] border-blue-100' : (jc.status === 'WAITING TO ASSIGN' || jc.status === 'OPEN' || jc.status === 'OPENING' || jc.status === 'UNASSIGNED' || !jc.mechanicName || jc.mechanicName === 'Unassigned') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100',
        rawJc: jc
      }));
    }
    return [];
  };

  const jobCards = getActiveJobCards();

  const filteredCards = jobCards.filter(jc => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      jc.jcNumber.toLowerCase().includes(q) ||
      jc.vehicleReg.toLowerCase().includes(q) ||
      jc.vehicleModel.toLowerCase().includes(q) ||
      jc.complaint.toLowerCase().includes(q)
    );
  });

  const openJobsCount = jobCards.length;
  const assignedJobsCount = jobCards.filter(jc => jc.status === 'Assigned').length;
  const workingJobsCount = jobCards.filter(jc => jc.status === 'Working').length;
  const waitingPartsCount = jobCards.filter(jc => jc.status === 'Waiting Parts').length;

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f6f8fc] overflow-y-auto box-border max-w-full text-slate-700 text-left font-sans relative min-h-[calc(100vh-70px)]">
      
      {/* Back navigation & Mini-KPIs row */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-[13px] text-slate-400 font-semibold uppercase tracking-wider">
          Service Management &gt; Open Job Cards
        </span>
      </div>

      {/* Mini KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full box-border">
        {/* Total Open */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Open</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">{openJobsCount}</span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} />
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">{assignedJobsCount}</span>
            <span className="text-[9.5px] font-semibold text-slate-400 mt-1">Mechanics on floor</span>
          </div>
          <div className="bg-blue-50 text-[#184edb] p-2.5 rounded-xl flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        {/* Working */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Working</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 font-heading">{workingJobsCount}</span>
            <span className="text-[9.5px] font-semibold text-slate-400 mt-1">Active progress</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl flex items-center justify-center">
            <Wrench size={20} />
          </div>
        </div>

        {/* Waiting Parts */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/60 flex items-center justify-between min-h-[85px] box-border relative">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waiting Parts</span>
            <span className="text-2xl font-extrabold text-red-500 tracking-tight mt-1 font-heading">{waitingPartsCount}</span>
            <span className="text-[9.5px] font-semibold text-red-500 mt-1">Critical hold</span>
          </div>
          <div className="bg-red-50 text-red-600 p-2.5 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight font-heading">
            Open Job Cards
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage and track all ongoing vehicle services and repairs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowTable(!showTable)}
            className={`flex items-center gap-1.5 px-3 py-2 border font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-xs ${
              showTable 
                ? 'bg-[#184edb] text-white border-[#184edb] hover:bg-[#143eb3]' 
                : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{showTable ? 'Hide Table' : 'Show Table'}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-lg text-xs cursor-pointer bg-white transition-colors">
            <Filter size={14} />
            <span>Filters</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-lg text-xs cursor-pointer bg-white transition-colors">
            <Download size={14} />
            <span>Export</span>
          </button>
          <button 
            onClick={onNewJobCard}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#184edb] hover:bg-[#143eb3] text-white font-bold rounded-lg text-xs cursor-pointer transition-colors border-none shadow-md"
          >
            <Plus size={14} />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      {showTable && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden w-full flex flex-col box-border">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-slate-650 text-[12.5px]">
            <thead>
              <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">JC NUMBER</th>
                <th className="py-3.5 px-5">CUSTOMER / VEHICLE</th>
                <th className="py-3.5 px-5">ENGINE / CHASSIS</th>
                <th className="py-3.5 px-5">PRIMARY COMPLAINT</th>
                <th className="py-3.5 px-5">MECHANIC</th>
                <th className="py-3.5 px-5">DATE IN</th>
                <th className="py-3.5 px-5">STATUS</th>
                <th className="py-3.5 px-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCards.map((jc) => (
                <tr key={jc.jcNumber} className="hover:bg-slate-50/20 transition-colors">
                  {/* JC Number */}
                  <td className="py-4 px-6 font-extrabold text-[#184edb]">
                    <div className="flex flex-col">
                      <span 
                        onClick={() => onViewJcDetails(jc)}
                        className="hover:underline cursor-pointer"
                      >
                        {jc.jcNumber}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {jc.vehicleModel.split(' ')[1] || 'PRO'} {jc.vehicleModel.split(' ')[2] || '3015'}
                      </span>
                    </div>
                  </td>

                  {/* Customer / Vehicle */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{jc.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5">{jc.vehicleReg}</span>
                    </div>
                  </td>

                  {/* Engine / Chassis */}
                  <td className="py-4 px-5 whitespace-nowrap text-[12px] font-mono">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-700 font-semibold">{jc.engineNo}</span>
                      <span className="text-slate-400">/ {jc.chassisNo}</span>
                    </div>
                  </td>

                  {/* Primary Complaint */}
                  <td className="py-4 px-5 max-w-[180px] truncate text-slate-600 font-semibold">
                    {jc.complaint}
                  </td>

                  {/* Mechanic */}
                  <td className="py-4 px-5">
                    {jc.mechanicStatus === 'unassigned' ? (
                      <span className="text-red-500 font-bold italic text-[13px]">{jc.mechanicName}</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] bg-blue-50 text-[#184edb] border border-blue-100">
                          {jc.mechanicInitials}
                        </div>
                        <span className="text-slate-750 font-bold text-[13px]">{jc.mechanicName}</span>
                      </div>
                    )}
                  </td>

                  {/* Date In */}
                  <td className="py-4 px-5 text-slate-550 leading-relaxed">
                    {jc.dateIn}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                      jc.status === 'Working' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : jc.status === 'Assigned' 
                          ? 'bg-blue-50 text-[#184edb] border-blue-100' 
                          : 'bg-red-50 text-red-500 border-red-100'
                    }`}>
                      {jc.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => onViewJcDetails(jc)}
                        title="View Details"
                        className="p-1.5 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Eye size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingJc(jc);
                          setEditStatus(jc.status);
                        }}
                        title="Edit Job Card Status"
                        className="p-1.5 bg-green-50 border border-green-100 rounded-md text-green-600 hover:bg-green-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          setAssigningJc(jc);
                          setSelectedMechanicId('');
                          setExpectedDeliveryDate(jc.expectedDelivery || 'Today, 05:00 PM');
                        }}
                        title="Assign Mechanic"
                        className="p-1.5 bg-cyan-50 border border-cyan-100 rounded-md text-cyan-600 hover:bg-cyan-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <UserPlus size={13} />
                      </button>
                      <button 
                        onClick={() => setAddingPartsJc(jc)}
                        title="Add Spare Parts"
                        className="p-1.5 bg-purple-50 border border-purple-100 rounded-md text-purple-600 hover:bg-purple-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Wrench size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          setCompletingJc(jc);
                          setLabourAmount(0);
                          setPartsAmount(0);
                          setDiscountPercent(0);
                        }}
                        title="Mark as Completed & Bill"
                        className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-600 hover:bg-emerald-100 cursor-pointer flex items-center justify-center transition-colors shadow-xs"
                      >
                        <CheckCircle size={13} />
                      </button>
                      <button 
                        title="More Actions"
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer flex items-center justify-center transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="bg-[#f8fafc] border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
          <span className="text-[12.5px] text-slate-500 font-medium">
            Showing {filteredCards.length} job cards
          </span>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 cursor-pointer transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#184edb] text-white font-bold text-xs border-none shadow-xs cursor-pointer">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer transition-colors">
              3
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-450 cursor-pointer transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      )}{/* Floating Action Button (FAB) at Bottom-Right */}
      <button 
        onClick={onNewJobCard}
        title="Add New Job Card"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#184edb] hover:bg-[#143eb3] text-white flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer border-none transition-all duration-200 z-50 hover:scale-105 active:scale-95"
      >
        <Plus size={24} />
      </button>

      {/* ADD PARTS MODAL */}
      {addingPartsJc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-800 m-0 font-heading">Add Parts to {addingPartsJc.jcNumber}</h3>
              <button
                onClick={() => setAddingPartsJc(null)}
                className="bg-transparent border-none text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-xs font-semibold text-slate-500">
              
              {(addingPartsJc.status === 'Waiting Parts' || addingPartsJc.status === 'WAITING PARTS') && (
                <div className="bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">
                    This vehicle is currently halted waiting for parts. Adding the required part will automatically resume work and update its status to <strong>WORKING</strong>.
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Part</label>
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 font-medium text-slate-700"
                >
                  <option value="">Select a part from inventory...</option>
                  {parts.map(p => (
                    <option key={p.id || p._id} value={p.partName}>{p.partName} - ₹{p.sellingPrice || p.price}</option>
                  ))}
                  {parts.length === 0 && <option disabled>No parts found in inventory</option>}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={partQty}
                  onChange={(e) => setPartQty(Number(e.target.value))}
                  className="border border-slate-200 rounded-md py-2 px-3 outline-none focus:border-blue-400 bg-slate-50 font-medium text-slate-700"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setAddingPartsJc(null)}
                  className="bg-transparent border-none text-slate-400 hover:text-slate-700 font-bold text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if(!selectedPart) return alert('Select a part');
                    
                    if (addingPartsJc.status === 'Waiting Parts' || addingPartsJc.status === 'WAITING PARTS') {
                      fetch(`${API_URL}/api/jobcards/${addingPartsJc.jcNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'WORKING' })
                      })
                      .then(() => {
                        alert(`Added ${partQty}x ${selectedPart} to ${addingPartsJc.jcNumber}. Work has resumed!`);
                        if (typeof window !== 'undefined') {
                           // Trigger a reload to fetch the updated status (since we don't have a fetchJobCards prop)
                           window.location.reload();
                        }
                        setAddingPartsJc(null);
                      })
                      .catch(err => {
                        console.error(err);
                        alert('Failed to add part.');
                      });
                    } else {
                      alert(`Added ${partQty}x ${selectedPart} to ${addingPartsJc.jcNumber}.`);
                      setAddingPartsJc(null);
                    }
                  }}
                  className="bg-[#184edb] hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-6 border-none rounded-md cursor-pointer transition-colors shadow-md"
                >
                  Add Part { (addingPartsJc.status === 'Waiting Parts' || addingPartsJc.status === 'WAITING PARTS') ? '& Resume' : '' }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK BILLING MODAL */}
      {completingJc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-800 m-0 font-heading">Complete Job & Quick Bill</h3>
              <button
                onClick={() => setCompletingJc(null)}
                className="bg-transparent border-none text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-xs font-semibold text-slate-500">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-200 flex items-start gap-2 mb-2">
                <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span className="leading-snug">
                  You are about to mark <strong>{completingJc.jcNumber}</strong> as completed. Enter the final bill amounts below.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Labour Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={labourAmount || ''}
                  onChange={(e) => setLabourAmount(Number(e.target.value))}
                  className="border border-slate-200 rounded-md py-2.5 px-3 outline-none focus:border-blue-400 bg-slate-50 font-bold text-slate-700 text-[14px]"
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spare Parts (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={partsAmount || ''}
                  onChange={(e) => setPartsAmount(Number(e.target.value))}
                  className="border border-slate-200 rounded-md py-2.5 px-3 outline-none focus:border-blue-400 bg-slate-50 font-bold text-slate-700 text-[14px]"
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent || ''}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="border border-slate-200 rounded-md py-2.5 px-3 outline-none focus:border-blue-400 bg-slate-50 font-bold text-slate-700 text-[14px]"
                  placeholder="0"
                />
              </div>

              {/* Dynamic Calculation */}
              {(() => {
                const subTotal = (labourAmount || 0) + (partsAmount || 0);
                const discountAmount = subTotal * ((discountPercent || 0) / 100);
                const totalAfterDiscount = subTotal - discountAmount;
                const gst = totalAfterDiscount * 0.18;
                const grandTotal = totalAfterDiscount + gst;

                return (
                  <div className="mt-2 bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{subTotal.toFixed(2)}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-[11px] font-bold text-green-600">
                        <span>Discount ({discountPercent}%)</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 pb-2 border-b border-slate-200">
                      <span>GST (18%)</span>
                      <span>₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[15px] font-extrabold text-[#184edb] pt-1">
                      <span>Grand Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setCompletingJc(null)}
                  className="bg-transparent border-none text-slate-400 hover:text-slate-700 font-bold text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const subTotal = (labourAmount || 0) + (partsAmount || 0);
                    const discountAmt = subTotal * ((discountPercent || 0) / 100);
                    const totalAfter = subTotal - discountAmt;
                    const gstAmt = totalAfter * 0.18;
                    const finalTotal = totalAfter + gstAmt;

                    // Update Status and Amount
                    fetch(`${API_URL}/api/jobcards/${completingJc.jcNumber}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        status: 'COMPLETED', 
                        doneTime: new Date().toLocaleTimeString(),
                        amount: finalTotal
                      })
                    })
                    .then(() => {
                      // Create Draft Bill (historical compat)
                      const draftsStr = localStorage.getItem('dms_service_drafts');
                      const drafts = draftsStr ? JSON.parse(draftsStr) : [];
                      const newDraft = {
                        id: `draft-${Date.now()}`,
                        billNo: `SB-${new Date().getFullYear()}-${Math.floor(Math.random()*10000)}`,
                        jobCardNo: completingJc.jcNumber,
                        customerName: completingJc.customerName,
                        phoneNumber: completingJc.rawJc?.mobileNumber || '',
                        vehicleNo: completingJc.vehicleReg,
                        model: completingJc.vehicleModel,
                        serviceDate: completingJc.dateIn,
                        engineNo: completingJc.engineNo,
                        chassisNo: completingJc.chassisNo,
                        assignedMechanic: completingJc.mechanicName,
                        serviceAdvisor: 'System',
                        deliveryDate: new Date().toLocaleDateString(),
                        deliveryTime: new Date().toLocaleTimeString(),
                        labourCharges: [{ id: 'l1', description: 'Quick Labour', hours: 1, rate: labourAmount || 0, amount: labourAmount || 0 }],
                        spareParts: [{ id: 'p1', partNo: 'VARIOUS', name: 'Quick Parts', qty: 1, price: partsAmount || 0, gstPercent: 18, total: partsAmount || 0, stockStatus: 'Available' }],
                        remarks: 'Auto-generated from Quick Billing',
                        discountPercent: discountPercent || 0,
                        grandTotal: finalTotal,
                        status: 'DRAFT',
                        createdAt: new Date().toLocaleDateString()
                      };
                      drafts.push(newDraft);
                      localStorage.setItem('dms_service_drafts', JSON.stringify(drafts));
                      
                      alert(`Successfully marked ${completingJc.jcNumber} as COMPLETED. Grand Total: ₹${finalTotal.toFixed(2)}`);
                      setCompletingJc(null);
                      
                      if (typeof window !== 'undefined') {
                        window.location.reload();
                      }
                    })
                    .catch(err => {
                      console.error(err);
                      alert('Failed to complete job card.');
                    });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 border-none rounded-md cursor-pointer transition-colors shadow-md flex items-center gap-2"
                >
                  <CheckCircle size={14} />
                  Finalize & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STATUS MODAL */}
      {editingJc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-800 m-0 font-heading">Edit Status: {editingJc.jcNumber}</h3>
              <button
                onClick={() => setEditingJc(null)}
                className="bg-transparent border-none text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Update Status</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:border-blue-500 bg-white font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="WORKING">Working (In-Progress)</option>
                  <option value="WAITING PARTS">Waiting for Parts</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                {editStatus === 'WAITING PARTS' && (
                  <span className="text-[11px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Will notify inventory department for parts.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingJc(null)}
                  className="bg-transparent border-none text-slate-400 hover:text-slate-700 font-bold text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fetch(`${API_URL}/api/jobcards/${editingJc.jcNumber}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: editStatus })
                    })
                    .then(res => {
                      if (!res.ok) throw new Error('Failed to update');
                      alert(`Job Card ${editingJc.jcNumber} updated successfully!`);
                      setEditingJc(null);
                      if (typeof window !== 'undefined') window.location.reload();
                    })
                    .catch(err => {
                      console.error(err);
                      alert('Error updating job card.');
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 border-none rounded-md cursor-pointer transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MECHANIC MODAL */}
      {assigningJc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-cyan-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-cyan-600 text-white rounded-xl flex items-center justify-center shadow-xs">
                  <UserPlus size={18} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-extrabold text-slate-800 m-0 font-heading">Assign Mechanic</h3>
                  <span className="text-[11px] font-bold text-cyan-700">
                    {assigningJc.jcNumber} • {assigningJc.vehicleModel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAssigningJc(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent p-1"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 text-xs font-semibold text-slate-600">
              
              {/* Info summary */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1 text-[11.5px]">
                <div className="flex justify-between items-center text-slate-800 font-bold">
                  <span>Customer: {assigningJc.customerName}</span>
                  <span className="text-slate-500 font-semibold">Reg: {assigningJc.vehicleReg}</span>
                </div>
                <span className="text-slate-500 font-medium truncate">Complaint: {assigningJc.complaint}</span>
              </div>

              {/* Mechanic Select Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">SELECT MECHANIC *</label>
                <select
                  value={selectedMechanicId}
                  onChange={(e) => setSelectedMechanicId(e.target.value)}
                  className="border border-slate-250 rounded-lg py-2.5 px-3 text-xs outline-none focus:border-cyan-500 bg-white font-bold text-slate-800 cursor-pointer"
                >
                  <option value="">-- Select Mechanic to Assign --</option>
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.status}) — {m.experience} Exp
                    </option>
                  ))}
                </select>
              </div>

              {/* Expected Delivery */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">EXPECTED COMPLETION TIME</label>
                <input
                  type="text"
                  placeholder="Today, 05:00 PM"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="border border-slate-250 rounded-lg py-2 px-3 text-xs outline-none focus:border-cyan-500 bg-white font-medium text-slate-700"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">SPECIAL INSTRUCTIONS</label>
                <textarea
                  rows={2}
                  placeholder="Add specific instructions for technician..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="border border-slate-250 rounded-lg p-2.5 text-xs outline-none focus:border-cyan-500 bg-white font-medium text-slate-700 resize-none font-sans"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssigningJc(null)}
                className="bg-transparent border-none text-slate-400 hover:text-slate-700 font-bold text-xs py-2 px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5 px-5 border-none rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                Confirm Assignment
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 bg-emerald-600 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};

export default OpenJobCards;
