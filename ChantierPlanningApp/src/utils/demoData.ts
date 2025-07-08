import { Task, TaskStatus, Priority, TaskCategory, TimeEntry } from '../types';
import { addDays, addHours } from 'date-fns';

// Données de démonstration pour tester l'application
export const generateDemoData = () => {
  const now = new Date();
  
  const demoTasks: Task[] = [
    {
      id: 'demo_1',
      title: 'Excavation du terrain',
      description: 'Préparation du terrain et excavation pour les fondations',
      startDate: addDays(now, -2),
      endDate: addDays(now, -1),
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      assignedTo: ['Jean Dupont', 'Pierre Martin'],
      location: 'Zone A - Fondations',
      estimatedHours: 16,
      actualHours: 14,
      materials: [
        { id: 'mat_1', name: 'Pelle mécanique', quantity: 1, unit: 'unité' },
        { id: 'mat_2', name: 'Camions', quantity: 3, unit: 'unités' },
      ],
      dependencies: [],
      category: TaskCategory.FOUNDATION,
      notes: 'Terrain plus facile à excaver que prévu',
      createdAt: addDays(now, -5),
      updatedAt: addDays(now, -1),
    },
    {
      id: 'demo_2',
      title: 'Coulage des fondations',
      description: 'Mise en place du béton pour les fondations',
      startDate: now,
      endDate: addDays(now, 1),
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      assignedTo: ['Marie Dubois', 'Paul Leroy'],
      location: 'Zone A - Fondations',
      estimatedHours: 24,
      actualHours: 8,
      materials: [
        { id: 'mat_3', name: 'Béton', quantity: 15, unit: 'm³' },
        { id: 'mat_4', name: 'Armatures', quantity: 800, unit: 'kg' },
      ],
      dependencies: ['demo_1'],
      category: TaskCategory.FOUNDATION,
      notes: 'Attention aux conditions météo',
      createdAt: addDays(now, -5),
      updatedAt: now,
    },
    {
      id: 'demo_3',
      title: 'Montage de la charpente',
      description: 'Installation de la structure bois principale',
      startDate: addDays(now, 3),
      endDate: addDays(now, 6),
      status: TaskStatus.NOT_STARTED,
      priority: Priority.HIGH,
      assignedTo: ['Antoine Bernard', 'Sophie Moreau'],
      location: 'Zone B - Structure',
      estimatedHours: 32,
      materials: [
        { id: 'mat_5', name: 'Poutres bois', quantity: 20, unit: 'unités' },
        { id: 'mat_6', name: 'Connecteurs', quantity: 100, unit: 'pièces' },
      ],
      dependencies: ['demo_2'],
      category: TaskCategory.STRUCTURE,
      notes: 'Prévoir grue pour le levage',
      createdAt: addDays(now, -5),
      updatedAt: addDays(now, -3),
    },
    {
      id: 'demo_4',
      title: 'Installation électrique',
      description: 'Mise en place du réseau électrique principal',
      startDate: addDays(now, 7),
      endDate: addDays(now, 9),
      status: TaskStatus.NOT_STARTED,
      priority: Priority.MEDIUM,
      assignedTo: ['Électricien certifié'],
      location: 'Ensemble du bâtiment',
      estimatedHours: 20,
      materials: [
        { id: 'mat_7', name: 'Câbles électriques', quantity: 200, unit: 'm' },
        { id: 'mat_8', name: 'Tableau électrique', quantity: 1, unit: 'unité' },
      ],
      dependencies: ['demo_3'],
      category: TaskCategory.ELECTRICAL,
      notes: 'Vérifier conformité aux normes',
      createdAt: addDays(now, -5),
      updatedAt: addDays(now, -2),
    },
    {
      id: 'demo_5',
      title: 'Inspection finale',
      description: 'Contrôle qualité et conformité avant livraison',
      startDate: addDays(now, 15),
      endDate: addDays(now, 15),
      status: TaskStatus.NOT_STARTED,
      priority: Priority.URGENT,
      assignedTo: ['Inspecteur agréé'],
      location: 'Ensemble du projet',
      estimatedHours: 4,
      materials: [],
      dependencies: ['demo_4'],
      category: TaskCategory.INSPECTION,
      notes: 'Préparer tous les documents',
      createdAt: addDays(now, -5),
      updatedAt: addDays(now, -1),
    },
  ];

  const demoTimeEntries: TimeEntry[] = [
    {
      id: 'time_1',
      taskId: 'demo_1',
      userId: 'jean_dupont',
      startTime: addDays(addHours(now, -26), -2),
      endTime: addDays(addHours(now, -18), -2),
      hours: 8,
      description: 'Excavation première phase',
      location: 'Zone A',
      createdAt: addDays(now, -2),
    },
    {
      id: 'time_2',
      taskId: 'demo_1',
      userId: 'pierre_martin',
      startTime: addDays(addHours(now, -14), -1),
      endTime: addDays(addHours(now, -8), -1),
      hours: 6,
      description: 'Finition excavation',
      location: 'Zone A',
      createdAt: addDays(now, -1),
    },
    {
      id: 'time_3',
      taskId: 'demo_2',
      userId: 'marie_dubois',
      startTime: addHours(now, -4),
      endTime: now,
      hours: 4,
      description: 'Préparation coulage béton',
      location: 'Zone A',
      createdAt: now,
    },
    {
      id: 'time_4',
      taskId: 'demo_2',
      userId: 'paul_leroy',
      startTime: addHours(now, -4),
      endTime: now,
      hours: 4,
      description: 'Mise en place armatures',
      location: 'Zone A',
      createdAt: now,
    },
  ];

  return { demoTasks, demoTimeEntries };
};

export const loadDemoData = async () => {
  const { StorageService } = await import('../services/StorageService');
  const { demoTasks, demoTimeEntries } = generateDemoData();

  try {
    // Charger les tâches de démonstration
    for (const task of demoTasks) {
      await StorageService.saveTask(task);
    }

    // Charger les entrées de temps de démonstration
    for (const timeEntry of demoTimeEntries) {
      await StorageService.saveTimeEntry(timeEntry);
    }

    console.log('✅ Données de démonstration chargées avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des données de démo:', error);
    return false;
  }
};