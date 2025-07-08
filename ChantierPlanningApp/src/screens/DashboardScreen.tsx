import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Header, Button } from 'react-native-elements';
import { format, isToday, isThisWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Task, TaskStatus, Priority, TimeEntry } from '../types';
import { StorageService } from '../services/StorageService';
import { AIService } from '../services/AIService';

const { width } = Dimensions.get('window');

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  efficiency: number;
  todayTasks: Task[];
  upcomingTasks: Task[];
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<ProjectStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
    efficiency: 0,
    todayTasks: [],
    upcomingTasks: [],
  });
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasks, entries] = await Promise.all([
        StorageService.getTasks(),
        StorageService.getTimeEntries(),
      ]);

      setTimeEntries(entries);
      calculateStats(tasks, entries);
      
      // Obtenir des suggestions IA
      if (tasks.length > 0) {
        const suggestions = await AIService.analyzePlanning(tasks);
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données du tableau de bord');
    }
  };

  const calculateStats = (tasks: Task[], entries: TimeEntry[]) => {
    const now = new Date();
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const overdueTasks = tasks.filter(task => 
      task.status !== TaskStatus.COMPLETED && 
      task.endDate < now
    ).length;

    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActualHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    
    const efficiency = totalEstimatedHours > 0 ? 
      (totalEstimatedHours / Math.max(totalActualHours, 1)) * 100 : 100;

    const todayTasks = tasks.filter(task => 
      isToday(task.startDate) && task.status !== TaskStatus.COMPLETED
    );

    const upcomingTasks = tasks.filter(task => 
      task.startDate > now && 
      task.startDate <= addDays(now, 7) &&
      task.status !== TaskStatus.COMPLETED
    ).slice(0, 5);

    setStats({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalEstimatedHours,
      totalActualHours,
      efficiency,
      todayTasks,
      upcomingTasks,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getCompletionPercentage = (): number => {
    return stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  };

  const getPriorityIcon = (priority: Priority): string => {
    switch (priority) {
      case Priority.URGENT: return '🔴';
      case Priority.HIGH: return '🟠';
      case Priority.MEDIUM: return '🟡';
      case Priority.LOW: return '🟢';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.NOT_STARTED: return '#FF6B6B';
      case TaskStatus.IN_PROGRESS: return '#4ECDC4';
      case TaskStatus.COMPLETED: return '#45B7D1';
      case TaskStatus.ON_HOLD: return '#FFA726';
      case TaskStatus.CANCELLED: return '#EF5350';
      default: return '#999';
    }
  };

  const getTodayHours = (): number => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return timeEntries
      .filter(entry => format(entry.startTime, 'yyyy-MM-dd') === today)
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getWeekHours = (): number => {
    return timeEntries
      .filter(entry => isThisWeek(entry.startTime))
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ 
          text: 'Tableau de Bord', 
          style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } 
        }}
        backgroundColor="#673AB7"
      />

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cartes de statistiques principales */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statNumber}>{stats.completedTasks}</Text>
              <Text style={styles.statLabel}>Tâches terminées</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
              <Text style={styles.statNumber}>{stats.inProgressTasks}</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#f44336' }]}>
              <Text style={styles.statNumber}>{stats.overdueTasks}</Text>
              <Text style={styles.statLabel}>En retard</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
              <Text style={styles.statNumber}>{stats.totalTasks}</Text>
              <Text style={styles.statLabel}>Total tâches</Text>
            </View>
          </View>
        </View>

        {/* Progression globale */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>📊 Progression du Projet</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getCompletionPercentage()}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {getCompletionPercentage().toFixed(1)}% complété
            </Text>
          </View>
          <Text style={styles.progressSubtext}>
            {stats.completedTasks} sur {stats.totalTasks} tâches terminées
          </Text>
        </View>

        {/* Heures de travail */}
        <View style={styles.hoursCard}>
          <Text style={styles.cardTitle}>⏰ Heures de Travail</Text>
          <View style={styles.hoursContainer}>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursNumber}>{getTodayHours().toFixed(1)}h</Text>
              <Text style={styles.hoursLabel}>Aujourd'hui</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursNumber}>{getWeekHours().toFixed(1)}h</Text>
              <Text style={styles.hoursLabel}>Cette semaine</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursNumber}>{stats.totalActualHours.toFixed(1)}h</Text>
              <Text style={styles.hoursLabel}>Total réalisé</Text>
            </View>
          </View>
          
          <View style={styles.efficiencyContainer}>
            <Text style={styles.efficiencyText}>
              Efficacité: {stats.efficiency.toFixed(1)}%
            </Text>
            <Text style={styles.efficiencySubtext}>
              {stats.totalEstimatedHours.toFixed(1)}h estimées vs {stats.totalActualHours.toFixed(1)}h réalisées
            </Text>
          </View>
        </View>

        {/* Tâches d'aujourd'hui */}
        <View style={styles.todayCard}>
          <Text style={styles.cardTitle}>📅 Tâches d'Aujourd'hui</Text>
          {stats.todayTasks.length === 0 ? (
            <Text style={styles.emptyText}>Aucune tâche prévue aujourd'hui</Text>
          ) : (
            stats.todayTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>
                    {getPriorityIcon(task.priority)} {task.title}
                  </Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(task.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {task.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.taskTime}>
                  ⏰ {task.estimatedHours}h - 📍 {task.location}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Tâches à venir */}
        <View style={styles.upcomingCard}>
          <Text style={styles.cardTitle}>🔮 Prochaines Tâches (7 jours)</Text>
          {stats.upcomingTasks.length === 0 ? (
            <Text style={styles.emptyText}>Aucune tâche prévue dans les 7 prochains jours</Text>
          ) : (
            stats.upcomingTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>
                    {getPriorityIcon(task.priority)} {task.title}
                  </Text>
                  <Text style={styles.taskDate}>
                    {format(task.startDate, 'dd/MM', { locale: fr })}
                  </Text>
                </View>
                <Text style={styles.taskTime}>
                  ⏰ {task.estimatedHours}h - 📍 {task.location}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Suggestions IA */}
        {aiSuggestions.length > 0 && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.cardTitle}>🤖 Suggestions IA</Text>
            {aiSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bouton d'action rapide */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.cardTitle}>⚡ Actions Rapides</Text>
          <View style={styles.quickActionsContainer}>
            <Button
              title="📊 Analyser Planning"
              onPress={async () => {
                try {
                  const tasks = await StorageService.getTasks();
                  const suggestions = await AIService.analyzePlanning(tasks);
                  Alert.alert(
                    'Analyse IA',
                    suggestions.join('\n\n'),
                    [{ text: 'OK' }]
                  );
                } catch (error) {
                  Alert.alert('Erreur', 'Impossible d\'analyser le planning');
                }
              }}
              buttonStyle={[styles.quickActionButton, { backgroundColor: '#9C27B0' }]}
              titleStyle={styles.quickActionText}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    width: (width - 45) / 2,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  progressSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  hoursCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  hoursItem: {
    alignItems: 'center',
  },
  hoursNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  hoursLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  efficiencyContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
    alignItems: 'center',
  },
  efficiencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  efficiencySubtext: {
    fontSize: 12,
    color: '#666',
  },
  todayCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  upcomingCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  taskItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  taskTime: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  suggestionsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  quickActionsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 30,
  },
  quickActionsContainer: {
    alignItems: 'center',
  },
  quickActionButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});