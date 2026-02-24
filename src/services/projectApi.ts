// src/services/projectApi.ts
import type { ProjectData } from '@/core/export/exportJSON';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function saveProject(
  projectData: ProjectData,
  projectId?: string,
  token: string
): Promise<{ id: string; url: string }> {
  const response = await fetch(`${API_URL}/projects${projectId ? `/${projectId}` : ''}`, {
    method: projectId ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(projectData)
  });

  if (!response.ok) throw new Error('Failed to save project');
  return response.json();
}

export async function loadProject(projectId: string, token: string): Promise<ProjectData> {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Failed to load project');
  return response.json();
}

export async function listProjects(token: string): Promise<Array<{ id: string; name: string; modifiedAt: string }>> {
  const response = await fetch(`${API_URL}/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Failed to list projects');
  return response.json();
}

export async function deleteProject(projectId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Failed to delete project');
}
