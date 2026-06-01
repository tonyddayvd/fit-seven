import React, { useState } from 'react';
import { useApp, MOCK_USERS } from '../context/AppContext';
import { Dumbbell, PlusCircle, CheckCircle, List, User } from 'lucide-react';

const INITIAL_EXERCISES = [
  { id: 'e1', name: 'Supino Reto com Barra', category: 'Peito', reps: '4x10' },
  { id: 'e2', name: 'Agachamento Livre', category: 'Pernas', reps: '4x12' },
  { id: 'e3', name: 'Puxada Alta na Polia', category: 'Costas', reps: '3x12' },
  { id: 'e4', name: 'Rosca Direta Biceps', category: 'Braços', reps: '3x15' },
];

const Professor = () => {
  const { activeTenantId, activeTenant } = useApp();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Filtrar apenas alunos do mesmo tenant
  const students = MOCK_USERS.filter(u => u.tenantId === activeTenantId && u.role === 'aluno');

  const handleAddExercise = (exercise) => {
    if (selectedExercises.some(e => e.id === exercise.id)) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const handlePrescribe = (e) => {
    e.preventDefault();
    if (!selectedStudent || !workoutName || selectedExercises.length === 0) {
      alert('Preencha todos os campos e selecione ao menos um exercício.');
      return;
    }

    const studentName = students.find(s => s.id === selectedStudent)?.name;

    setSuccessMsg(`Treino "${workoutName}" prescrito com sucesso para ${studentName}!`);
    setTimeout(() => {
      setSuccessMsg('');
      setWorkoutName('');
      setSelectedStudent('');
      setSelectedExercises([]);
    }, 4000);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.headerCard} className="glass">
        <h2 style={styles.title}>Painel do Professor</h2>
        <p style={styles.subtitle}>Unidade: {activeTenant.name} (Tenant: <code style={styles.code}>{activeTenantId}</code>)</p>
      </div>

      {successMsg && (
        <div style={styles.successAlert}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={styles.grid}>
        {/* Formulário de Prescrição */}
        <div style={styles.formCard} className="glass">
          <h3 style={styles.sectionTitle}>Prescrever Novo Treino</h3>
          <form onSubmit={handlePrescribe} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Selecionar Aluno deste Tenant:</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                style={styles.select}
                required
              >
                <option value="">Selecione o Aluno...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nome do Treino:</label>
              <input
                type="text"
                placeholder="Ex: Treino A - Hipertrofia Peitoral"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Exercícios Selecionados ({selectedExercises.length}):</label>
              {selectedExercises.length === 0 ? (
                <p style={styles.hint}>Selecione exercícios na lista ao lado.</p>
              ) : (
                <div style={styles.badgeContainer}>
                  {selectedExercises.map(e => (
                    <span key={e.id} style={styles.exerciseBadge}>
                      {e.name} ({e.reps})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" style={styles.submitBtn} className="btn-primary">
              Gravar Treino com tenant_id
            </button>
          </form>
        </div>

        {/* Lista de Exercícios Disponíveis */}
        <div style={styles.listCard} className="glass">
          <h3 style={styles.sectionTitle}>Biblioteca de Exercícios</h3>
          <p style={styles.listSubtitle}>Selecione os exercícios para incluir no treino:</p>
          <div style={styles.exerciseList}>
            {INITIAL_EXERCISES.map(e => {
              const isSelected = selectedExercises.some(se => se.id === e.id);
              return (
                <div 
                  key={e.id} 
                  onClick={() => handleAddExercise(e)}
                  style={{
                    ...styles.exerciseItem,
                    ...(isSelected ? styles.exerciseItemSelected : {})
                  }}
                >
                  <div style={styles.exerciseDetails}>
                    <span style={styles.exerciseName}>{e.name}</span>
                    <span style={styles.exerciseCat}>{e.category}</span>
                  </div>
                  <div style={styles.exerciseMeta}>
                    <span style={styles.repsText}>{e.reps}</span>
                    <PlusCircle 
                      size={20} 
                      style={{ 
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        transform: isSelected ? 'rotate(45deg)' : 'none',
                        transition: 'all var(--transition-fast)'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  headerCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  code: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: '600',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--status-success-bg)',
    color: 'var(--status-success)',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    animation: 'fadeIn 0.3s ease-out',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  formCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  listCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  listSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  select: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  hint: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  badgeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  exerciseBadge: {
    fontSize: '0.75rem',
    padding: '6px 12px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--primary-hover)',
    color: '#ffffff',
    fontWeight: '500',
  },
  submitBtn: {
    padding: '12px',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  exerciseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  exerciseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  exerciseItemSelected: {
    borderColor: 'var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  exerciseDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  exerciseName: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  exerciseCat: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  exerciseMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  repsText: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  }
};

export default Professor;
