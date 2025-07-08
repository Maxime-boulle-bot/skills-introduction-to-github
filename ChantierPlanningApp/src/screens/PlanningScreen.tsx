import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Button, Card, Header, Input, ButtonGroup } from 'react-native-elements';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Task, TaskStatus, Priority, TaskCategory, AIPrompt } from '../types';
import { StorageService } from '../services/StorageService';
import { AIService } from '../services/AIService';

export default function PlanningScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiPrompt, setAiPrompt] = useState<AIPrompt>({
    projectDescription: '',
    duration: 30,
    teamSize: 5,
    priorities: [],
    constraints: [],
    requirements: [],
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const savedTasks = await StorageService.getTasks();
      setTasks(savedTasks);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les tâches');
    } finally {
      setLoading(false);
    }
  };

  const generatePlanningWithAI = async () => {
    if (!aiPrompt.projectDescription.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire votre projet');
      return;
    }

    setLoading(true);
    try {
      const generatedTasks = await AIService.generatePlanning(aiPrompt);
      
      // Sauvegarder les tâches générées
      for (const task of generatedTasks) {
        await StorageService.saveTask(task);
      }
      
      setTasks(generatedTasks);
      setShowAIModal(false);
      Alert.alert('Succès', `${generatedTasks.length} tâches générées avec succès !`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le planning');
    } finally {
      setLoading(false);
    }
  };

  const saveTask = async (task: Task) => {
    try {
      await StorageService.saveTask(task);
      await loadTasks();
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la tâche');
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = { ...task, status, updatedAt: new Date() };
        await StorageService.saveTask(updatedTask);
        await loadTasks();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la tâche');
    }
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette tâche ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteTask(taskId);
              await loadTasks();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la tâche');
            }
          },
        },
      ]
    );
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => {
      const taskDate = format(task.startDate, 'yyyy-MM-dd');
      return taskDate === date;
    });
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    tasks.forEach(task => {
      const date = format(task.startDate, 'yyyy-MM-dd');
      const color = getStatusColor(task.status);
      
      if (!marked[date]) {
        marked[date] = { dots: [] };
      }
      
      marked[date].dots.push({ color });
    });

    // Marquer la date sélectionnée
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF',
    };

    return marked;
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.NOT_STARTED: return '#FF6B6B';
      case TaskStatus.IN_PROGRESS: return '#4ECDC4';
      case TaskStatus.COMPLETED: return '#45B7D1';
      case TaskStatus.ON_HOLD: return '#FFA726';
      case TaskStatus.CANCELLED: return '#EF5350';
      default: return '#999';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT: return '🔴';
      case Priority.HIGH: return '🟠';
      case Priority.MEDIUM: return '🟡';
      case Priority.LOW: return '🟢';
      default: return '⚪';
    }
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ 
          text: 'Planning Chantier', 
          style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
        }}
        backgroundColor="#007AFF"
      />

      <View style={styles.buttonContainer}>
        <Button
          title="🤖 Générer avec IA"
          onPress={() => setShowAIModal(true)}
          buttonStyle={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          titleStyle={styles.buttonText}
        />
        <Button
          title="➕ Nouvelle tâche"
          onPress={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}
          buttonStyle={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          titleStyle={styles.buttonText}
        />
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markingType="multi-dot"
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#007AFF',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: 'orange',
          disabledArrowColor: '#d9e1e8',
          monthTextColor: 'blue',
          indicatorColor: 'blue',
        }}
      />

      <View style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>
          Tâches du {format(parseISO(selectedDate), 'dd MMMM yyyy', { locale: fr })}
        </Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <ScrollView style={styles.tasksList}>
            {selectedDateTasks.length === 0 ? (
              <Text style={styles.emptyText}>Aucune tâche pour cette date</Text>
            ) : (
              selectedDateTasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>
                      {getPriorityIcon(task.priority)} {task.title}
                    </Text>
                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingTask(task);
                          setShowTaskModal(true);
                        }}
                        style={styles.editButton}
                      >
                        <Text>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteTask(task.id)}
                        style={styles.deleteButton}
                      >
                        <Text>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <Text style={styles.taskDetails}>
                    📍 {task.location} | ⏰ {task.estimatedHours}h | 👥 {task.assignedTo.length} assigné(s)
                  </Text>
                  
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Statut:</Text>
                    <View style={styles.statusButtons}>
                      {Object.values(TaskStatus).map((status) => (
                        <TouchableOpacity
                          key={status}
                          onPress={() => updateTaskStatus(task.id, status)}
                          style={[
                            styles.statusButton,
                            { backgroundColor: getStatusColor(status) },
                            task.status === status && styles.activeStatusButton,
                          ]}
                        >
                          <Text style={styles.statusButtonText}>
                            {status.replace('_', ' ').toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal IA */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🤖 Génération IA du Planning</Text>
            
            <Input
              placeholder="Décrivez votre projet (ex: Construction d'une maison)"
              value={aiPrompt.projectDescription}
              onChangeText={(text) => 
                setAiPrompt(prev => ({ ...prev, projectDescription: text }))
              }
              multiline
              numberOfLines={3}
            />
            
            <Input
              placeholder="Durée en jours"
              value={aiPrompt.duration.toString()}
              onChangeText={(text) => 
                setAiPrompt(prev => ({ ...prev, duration: parseInt(text) || 30 }))
              }
              keyboardType="numeric"
            />
            
            <Input
              placeholder="Taille de l'équipe"
              value={aiPrompt.teamSize.toString()}
              onChangeText={(text) => 
                setAiPrompt(prev => ({ ...prev, teamSize: parseInt(text) || 5 }))
              }
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Annuler"
                onPress={() => setShowAIModal(false)}
                buttonStyle={[styles.modalButton, { backgroundColor: '#999' }]}
              />
              <Button
                title="Générer"
                onPress={generatePlanningWithAI}
                buttonStyle={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
  },
  actionButton: {
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tasksContainer: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  loader: {
    marginTop: 50,
  },
  tasksList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  taskActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 5,
    marginLeft: 10,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  taskDetails: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  statusContainer: {
    marginTop: 10,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  activeStatusButton: {
    borderWidth: 2,
    borderColor: '#333',
  },
  statusButtonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 25,
    paddingHorizontal: 30,
    margin: 10,
  },
});