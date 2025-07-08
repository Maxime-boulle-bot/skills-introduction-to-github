import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Button, Header, Input, Card } from 'react-native-elements';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Task, TimeEntry, TaskStatus } from '../types';
import { StorageService } from '../services/StorageService';

export default function TimeTrackingScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTasks, setActiveTasks] = useState<Map<string, Date>>(new Map());
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [manualHours, setManualHours] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    
    // Mettre à jour l'heure actuelle chaque seconde
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [savedTasks, savedTimeEntries] = await Promise.all([
        StorageService.getTasks(),
        StorageService.getTimeEntries(),
      ]);
      
      setTasks(savedTasks.filter(task => task.status !== TaskStatus.COMPLETED));
      setTimeEntries(savedTimeEntries);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    }
  };

  const startTask = (task: Task) => {
    const newActiveTasks = new Map(activeTasks);
    newActiveTasks.set(task.id, new Date());
    setActiveTasks(newActiveTasks);
    
    Alert.alert('Tâche démarrée', `Pointage commencé pour: ${task.title}`);
  };

  const stopTask = async (task: Task) => {
    const startTime = activeTasks.get(task.id);
    if (!startTime) return;

    const endTime = new Date();
    const hours = differenceInMinutes(endTime, startTime) / 60;

    const timeEntry: TimeEntry = {
      id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId: task.id,
      userId: 'current_user', // Dans une vraie app, ceci viendrait de l'authentification
      startTime,
      endTime,
      hours: Math.round(hours * 100) / 100, // Arrondir à 2 décimales
      description: `Travail sur: ${task.title}`,
      location: task.location,
      createdAt: new Date(),
    };

    try {
      await StorageService.saveTimeEntry(timeEntry);
      
      // Mettre à jour les heures réelles de la tâche
      const updatedTask = {
        ...task,
        actualHours: (task.actualHours || 0) + timeEntry.hours,
        updatedAt: new Date(),
      };
      
      await StorageService.saveTask(updatedTask);
      
      // Retirer la tâche des tâches actives
      const newActiveTasks = new Map(activeTasks);
      newActiveTasks.delete(task.id);
      setActiveTasks(newActiveTasks);
      
      await loadData();
      
      Alert.alert(
        'Tâche terminée',
        `Temps enregistré: ${timeEntry.hours.toFixed(2)}h pour "${task.title}"`
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le pointage');
    }
  };

  const addManualTimeEntry = async () => {
    if (!selectedTask || !manualHours.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner une tâche et saisir les heures');
      return;
    }

    const hours = parseFloat(manualHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre d\'heures valide');
      return;
    }

    const now = new Date();
    const timeEntry: TimeEntry = {
      id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId: selectedTask.id,
      userId: 'current_user',
      startTime: new Date(now.getTime() - hours * 60 * 60 * 1000),
      endTime: now,
      hours,
      description: manualDescription.trim() || `Saisie manuelle pour: ${selectedTask.title}`,
      location: selectedTask.location,
      createdAt: now,
    };

    try {
      await StorageService.saveTimeEntry(timeEntry);
      
      // Mettre à jour les heures réelles de la tâche
      const updatedTask = {
        ...selectedTask,
        actualHours: (selectedTask.actualHours || 0) + hours,
        updatedAt: new Date(),
      };
      
      await StorageService.saveTask(updatedTask);
      
      setSelectedTask(null);
      setManualHours('');
      setManualDescription('');
      setShowTaskSelector(false);
      
      await loadData();
      
      Alert.alert('Succès', `${hours}h ajoutées à "${selectedTask.title}"`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le pointage');
    }
  };

  const getActiveTaskDuration = (taskId: string): string => {
    const startTime = activeTasks.get(taskId);
    if (!startTime) return '';
    
    const minutes = differenceInMinutes(currentTime, startTime);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
  };

  const getTotalHoursForTask = (taskId: string): number => {
    return timeEntries
      .filter(entry => entry.taskId === taskId)
      .reduce((total, entry) => total + entry.hours, 0);
  };

  const getTodayTimeEntries = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return timeEntries.filter(entry => 
      format(entry.startTime, 'yyyy-MM-dd') === today
    );
  };

  const getTotalHoursToday = (): number => {
    return getTodayTimeEntries().reduce((total, entry) => total + entry.hours, 0);
  };

  const renderTaskItem = ({ item: task }: { item: Task }) => {
    const isActive = activeTasks.has(task.id);
    const totalHours = getTotalHoursForTask(task.id);
    const progress = task.estimatedHours > 0 ? (totalHours / task.estimatedHours) * 100 : 0;

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskCategory}>{task.category}</Text>
        </View>
        
        <Text style={styles.taskDescription}>{task.description}</Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progression: {totalHours.toFixed(1)}h / {task.estimatedHours}h ({progress.toFixed(0)}%)
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progress, 100)}%` }
              ]} 
            />
          </View>
        </View>

        {isActive && (
          <Text style={styles.activeTimer}>
            ⏱️ En cours: {getActiveTaskDuration(task.id)}
          </Text>
        )}

        <View style={styles.taskActions}>
          {isActive ? (
            <Button
              title="⏹️ Arrêter"
              onPress={() => stopTask(task)}
              buttonStyle={[styles.actionButton, { backgroundColor: '#f44336' }]}
              titleStyle={styles.buttonText}
            />
          ) : (
            <Button
              title="▶️ Démarrer"
              onPress={() => startTask(task)}
              buttonStyle={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              titleStyle={styles.buttonText}
            />
          )}
        </View>
      </View>
    );
  };

  const renderTimeEntry = ({ item: entry }: { item: TimeEntry }) => {
    const task = tasks.find(t => t.id === entry.taskId);
    
    return (
      <View style={styles.timeEntryCard}>
        <View style={styles.timeEntryHeader}>
          <Text style={styles.timeEntryTask}>
            {task?.title || 'Tâche supprimée'}
          </Text>
          <Text style={styles.timeEntryHours}>
            {entry.hours.toFixed(2)}h
          </Text>
        </View>
        
        <Text style={styles.timeEntryTime}>
          {format(entry.startTime, 'HH:mm', { locale: fr })} - {' '}
          {entry.endTime ? format(entry.endTime, 'HH:mm', { locale: fr }) : 'En cours'}
        </Text>
        
        {entry.description && (
          <Text style={styles.timeEntryDescription}>{entry.description}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ 
          text: 'Pointage', 
          style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
        }}
        backgroundColor="#FF9800"
      />

      {/* Résumé du jour */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Aujourd'hui</Text>
        <Text style={styles.summaryHours}>
          {getTotalHoursToday().toFixed(2)} heures travaillées
        </Text>
        <Text style={styles.summaryEntries}>
          {getTodayTimeEntries().length} pointages
        </Text>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionContainer}>
        <Button
          title="📝 Saisie manuelle"
          onPress={() => setShowTaskSelector(true)}
          buttonStyle={[styles.mainActionButton, { backgroundColor: '#2196F3' }]}
          titleStyle={styles.buttonText}
        />
      </View>

      {/* Liste des tâches */}
      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Tâches disponibles</Text>
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.tasksList}
        />
      </View>

      {/* Modal de sélection de tâche pour saisie manuelle */}
      <Modal
        visible={showTaskSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTaskSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 Saisie manuelle</Text>
            
            <TouchableOpacity
              style={styles.taskSelectorButton}
              onPress={() => {
                // Ici on pourrait ouvrir un autre modal pour sélectionner la tâche
                if (tasks.length > 0) {
                  setSelectedTask(tasks[0]); // Pour simplifier, on prend la première tâche
                }
              }}
            >
              <Text style={styles.taskSelectorText}>
                {selectedTask ? selectedTask.title : 'Sélectionner une tâche'}
              </Text>
            </TouchableOpacity>

            <Input
              placeholder="Nombre d'heures (ex: 2.5)"
              value={manualHours}
              onChangeText={setManualHours}
              keyboardType="numeric"
              leftIcon={{ name: 'schedule', color: '#999' }}
            />

            <Input
              placeholder="Description (optionnel)"
              value={manualDescription}
              onChangeText={setManualDescription}
              multiline
              numberOfLines={2}
              leftIcon={{ name: 'description', color: '#999' }}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Annuler"
                onPress={() => {
                  setShowTaskSelector(false);
                  setSelectedTask(null);
                  setManualHours('');
                  setManualDescription('');
                }}
                buttonStyle={[styles.modalButton, { backgroundColor: '#999' }]}
              />
              <Button
                title="Enregistrer"
                onPress={addManualTimeEntry}
                buttonStyle={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
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
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryHours: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  summaryEntries: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  mainActionButton: {
    borderRadius: 25,
    paddingVertical: 12,
  },
  tasksSection: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  tasksList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
  taskCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  activeTimer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 10,
    textAlign: 'center',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeEntryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  timeEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  timeEntryTask: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  timeEntryHours: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  timeEntryTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  timeEntryDescription: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
  taskSelectorButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },
  taskSelectorText: {
    fontSize: 16,
    color: '#333',
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