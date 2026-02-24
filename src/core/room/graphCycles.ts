// src/core/room/graphCycles.ts
interface GraphNode {
  id: string;
  edges: string[];
}

interface GraphEdge {
  id: string;
  start: string;
  end: string;
}

export function findCycles(nodes: Map<string, GraphNode>, edges: Map<string, GraphEdge>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    if (recursionStack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart);
        if (cycle.length >= 3 && !cycleExists(cycles, cycle)) {
          cycles.push(cycle);
        }
      }
      return;
    }

    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const node = nodes.get(nodeId);
    if (node) {
      for (const edgeId of node.edges) {
        const edge = edges.get(edgeId);
        if (edge) {
          const nextNodeId = edge.start === nodeId ? edge.end : edge.start;
          if (!recursionStack.has(nextNodeId) || path.includes(nextNodeId)) {
            dfs(nextNodeId, [...path]);
          }
        }
      }
    }

    recursionStack.delete(nodeId);
  }

  for (const nodeId of nodes.keys()) {
    visited.clear();
    recursionStack.clear();
    dfs(nodeId, []);
  }

  return filterMinimalCycles(cycles);
}

function cycleExists(cycles: string[][], newCycle: string[]): boolean {
  const normalizedNew = normalizeCycle(newCycle);
  for (const cycle of cycles) {
    if (cyclesEqual(normalizeCycle(cycle), normalizedNew)) {
      return true;
    }
  }
  return false;
}

function normalizeCycle(cycle: string[]): string[] {
  const rotations: string[][] = [];
  for (let i = 0; i < cycle.length; i++) {
    rotations.push([...cycle.slice(i), ...cycle.slice(0, i)]);
  }
  const reversed = [...cycle].reverse();
  for (let i = 0; i < reversed.length; i++) {
    rotations.push([...reversed.slice(i), ...reversed.slice(0, i)]);
  }
  return rotations.sort().shift()!;
}

function cyclesEqual(cycle1: string[], cycle2: string[]): boolean {
  if (cycle1.length !== cycle2.length) return false;
  for (let i = 0; i < cycle1.length; i++) {
    if (cycle1[i] !== cycle2[i]) return false;
  }
  return true;
}

function filterMinimalCycles(cycles: string[][]): string[][] {
  cycles.sort((a, b) => a.length - b.length);
  const filtered: string[][] = [];

  for (const cycle of cycles) {
    let isMinimal = true;
    const cycleSet = new Set(cycle);

    for (const existing of filtered) {
      const existingSet = new Set(existing);
      if (isSubset(existingSet, cycleSet)) {
        isMinimal = false;
        break;
      }
    }

    if (isMinimal) {
      filtered.push(cycle);
    }
  }

  return filtered;
}

function isSubset(subset: Set<string>, superset: Set<string>): boolean {
  for (const item of subset) {
    if (!superset.has(item)) return false;
  }
  return true;
}
