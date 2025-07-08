import { Task, TaskCategory, Priority, TaskStatus, AIPrompt } from '../types';
import { format, addDays, addHours } from 'date-fns';

export class AIService {
  // Simuler un service IA local pour générer des plannings
  // Dans une vraie application, ceci ferait appel à une API IA comme OpenAI
  
  private static readonly taskTemplates = {
    [TaskCategory.FOUNDATION]: [
      { title: 'Excavation du terrain', hours: 16, dependencies: [] },
      { title: 'Coulage des fondations', hours: 24, dependencies: ['Excavation du terrain'] },
      { title: 'Séchage des fondations', hours: 48, dependencies: ['Coulage des fondations'] },
    ],
    [TaskCategory.STRUCTURE]: [
      { title: 'Montage de la charpente', hours: 32, dependencies: ['Séchage des fondations'] },
      { title: 'Installation des murs porteurs', hours: 24, dependencies: ['Montage de la charpente'] },
      { title: 'Installation de la toiture', hours: 20, dependencies: ['Montage de la charpente'] },
    ],
    [TaskCategory.ELECTRICAL]: [
      { title: 'Installation du tableau électrique', hours: 8, dependencies: ['Installation des murs porteurs'] },
      { title: 'Passage des câbles', hours: 16, dependencies: ['Installation du tableau électrique'] },
      { title: 'Installation des prises et interrupteurs', hours: 12, dependencies: ['Passage des câbles'] },
    ],
    [TaskCategory.PLUMBING]: [
      { title: 'Installation des canalisations principales', hours: 12, dependencies: ['Installation des murs porteurs'] },
      { title: 'Installation des sanitaires', hours: 16, dependencies: ['Installation des canalisations principales'] },
      { title: 'Tests d\'étanchéité', hours: 4, dependencies: ['Installation des sanitaires'] },
    ],
    [TaskCategory.FINISHING]: [
      { title: 'Pose du revêtement de sol', hours: 20, dependencies: ['Installation des prises et interrupteurs', 'Tests d\'étanchéité'] },
      { title: 'Peinture des murs', hours: 24, dependencies: ['Installation des prises et interrupteurs'] },
      { title: 'Installation des portes et fenêtres', hours: 16, dependencies: ['Peinture des murs'] },
    ],
    [TaskCategory.INSPECTION]: [
      { title: 'Inspection finale', hours: 4, dependencies: ['Installation des portes et fenêtres'] },
      { title: 'Livraison du chantier', hours: 2, dependencies: ['Inspection finale'] },
    ],
    [TaskCategory.OTHER]: [
      { title: 'Tâche personnalisée', hours: 8, dependencies: [] },
    ],
  };

  static async generatePlanning(prompt: AIPrompt): Promise<Task[]> {
    try {
      // Simuler un délai de traitement IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      const tasks: Task[] = [];
      const startDate = new Date();
      let currentDate = new Date(startDate);

      // Déterminer les catégories de tâches basées sur la description du projet
      const categories = this.determineTaskCategories(prompt.projectDescription);
      
      // Générer les tâches pour chaque catégorie
      for (const category of categories) {
        const categoryTasks = this.taskTemplates[category] || [];
        
        for (const template of categoryTasks) {
          const task: Task = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: template.title,
            description: `Tâche générée automatiquement pour: ${template.title}`,
            startDate: new Date(currentDate),
            endDate: addHours(currentDate, template.hours),
            status: TaskStatus.NOT_STARTED,
            priority: this.determinePriority(template.title, prompt.priorities),
            assignedTo: [],
            location: 'Chantier principal',
            estimatedHours: template.hours,
            materials: this.generateMaterials(template.title),
            dependencies: this.resolveDependencies(template.dependencies, tasks),
            category: category,
            notes: 'Tâche générée par IA',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          tasks.push(task);
          
          // Avancer la date pour la prochaine tâche
          currentDate = addHours(currentDate, template.hours + 2); // +2h de marge
        }
      }

      // Optimiser la séquence des tâches en fonction des dépendances
      return this.optimizeTaskSequence(tasks, prompt.duration);
    } catch (error) {
      console.error('Error generating planning:', error);
      throw new Error('Erreur lors de la génération du planning');
    }
  }

  private static determineTaskCategories(description: string): TaskCategory[] {
    const desc = description.toLowerCase();
    const categories: TaskCategory[] = [];

    // Logique simple pour déterminer les catégories basées sur les mots-clés
    if (desc.includes('maison') || desc.includes('construction') || desc.includes('bâtiment')) {
      categories.push(
        TaskCategory.FOUNDATION,
        TaskCategory.STRUCTURE,
        TaskCategory.ELECTRICAL,
        TaskCategory.PLUMBING,
        TaskCategory.FINISHING,
        TaskCategory.INSPECTION
      );
    } else if (desc.includes('électrique') || desc.includes('électricité')) {
      categories.push(TaskCategory.ELECTRICAL);
    } else if (desc.includes('plomberie') || desc.includes('sanitaire')) {
      categories.push(TaskCategory.PLUMBING);
    } else if (desc.includes('finition') || desc.includes('peinture')) {
      categories.push(TaskCategory.FINISHING);
    } else {
      // Par défaut, inclure toutes les catégories
      categories.push(...Object.values(TaskCategory));
    }

    return categories;
  }

  private static determinePriority(taskTitle: string, priorities: string[]): Priority {
    const title = taskTitle.toLowerCase();
    
    if (priorities.some(p => title.includes(p.toLowerCase()))) {
      return Priority.HIGH;
    }
    
    if (title.includes('fondation') || title.includes('structure')) {
      return Priority.HIGH;
    }
    
    if (title.includes('inspection') || title.includes('sécurité')) {
      return Priority.URGENT;
    }
    
    if (title.includes('finition') || title.includes('peinture')) {
      return Priority.LOW;
    }
    
    return Priority.MEDIUM;
  }

  private static generateMaterials(taskTitle: string) {
    const title = taskTitle.toLowerCase();
    const materials = [];

    if (title.includes('fondation')) {
      materials.push(
        { id: 'mat_1', name: 'Béton', quantity: 10, unit: 'm³' },
        { id: 'mat_2', name: 'Armatures', quantity: 500, unit: 'kg' }
      );
    } else if (title.includes('électrique')) {
      materials.push(
        { id: 'mat_3', name: 'Câbles électriques', quantity: 100, unit: 'm' },
        { id: 'mat_4', name: 'Prises électriques', quantity: 20, unit: 'pièces' }
      );
    } else if (title.includes('peinture')) {
      materials.push(
        { id: 'mat_5', name: 'Peinture', quantity: 50, unit: 'L' },
        { id: 'mat_6', name: 'Pinceaux', quantity: 10, unit: 'pièces' }
      );
    }

    return materials;
  }

  private static resolveDependencies(templateDependencies: string[], existingTasks: Task[]): string[] {
    const dependencies: string[] = [];
    
    for (const depTitle of templateDependencies) {
      const dependentTask = existingTasks.find(task => 
        task.title.toLowerCase().includes(depTitle.toLowerCase())
      );
      
      if (dependentTask) {
        dependencies.push(dependentTask.id);
      }
    }
    
    return dependencies;
  }

  private static optimizeTaskSequence(tasks: Task[], maxDuration: number): Task[] {
    // Optimisation simple basée sur les dépendances et la durée
    const optimizedTasks = [...tasks];
    let currentDate = new Date();

    // Trier les tâches par priorité et dépendances
    optimizedTasks.sort((a, b) => {
      if (a.dependencies.length !== b.dependencies.length) {
        return a.dependencies.length - b.dependencies.length;
      }
      
      const priorityOrder = {
        [Priority.URGENT]: 4,
        [Priority.HIGH]: 3,
        [Priority.MEDIUM]: 2,
        [Priority.LOW]: 1,
      };
      
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Réajuster les dates en fonction de l'optimisation
    for (const task of optimizedTasks) {
      task.startDate = new Date(currentDate);
      task.endDate = addHours(currentDate, task.estimatedHours);
      currentDate = addHours(currentDate, task.estimatedHours + 1);
    }

    return optimizedTasks;
  }

  // Méthode pour simuler l'analyse d'un projet existant et suggérer des améliorations
  static async analyzePlanning(tasks: Task[]): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const suggestions: string[] = [];

    // Analyser les goulots d'étranglement
    const criticalPath = tasks.filter(task => task.priority === Priority.URGENT || task.priority === Priority.HIGH);
    if (criticalPath.length > tasks.length * 0.6) {
      suggestions.push('⚠️ Trop de tâches critiques détectées. Considérez redistributer les priorités.');
    }

    // Analyser la charge de travail
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    if (totalHours > 400) {
      suggestions.push('📊 La charge de travail semble élevée. Envisagez d\'ajouter des ressources ou d\'étaler le planning.');
    }

    // Analyser les dépendances
    const tasksWithManyDeps = tasks.filter(task => task.dependencies.length > 3);
    if (tasksWithManyDeps.length > 0) {
      suggestions.push('🔗 Certaines tâches ont beaucoup de dépendances. Vérifiez si elles peuvent être simplifiées.');
    }

    // Analyser la répartition par catégorie
    const categories = [...new Set(tasks.map(task => task.category))];
    if (categories.length < 3) {
      suggestions.push('🏗️ Le projet semble incomplet. Avez-vous considéré toutes les phases de construction ?');
    }

    if (suggestions.length === 0) {
      suggestions.push('✅ Votre planning semble bien équilibré !');
    }

    return suggestions;
  }
}