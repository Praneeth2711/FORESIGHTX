import { useState, useEffect } from 'react';

type Listener = () => void;

class Store {
  progress = 0;
  activeBranch: 'A' | 'B' | 'C' = 'B';
  hoveredBranch: 'A' | 'B' | 'C' | null = null;
  listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  setActiveBranch(branch: 'A' | 'B' | 'C') {
    if (this.activeBranch !== branch) {
      this.activeBranch = branch;
      this.notify();
    }
  }

  setHoveredBranch(branch: 'A' | 'B' | 'C' | null) {
    if (this.hoveredBranch !== branch) {
      this.hoveredBranch = branch;
      this.notify();
    }
  }
}

export const scrollState = new Store();

export function useStore() {
  const [state, setState] = useState({ 
    activeBranch: scrollState.activeBranch, 
    hoveredBranch: scrollState.hoveredBranch 
  });
  
  useEffect(() => {
    return scrollState.subscribe(() => {
      setState({ 
        activeBranch: scrollState.activeBranch, 
        hoveredBranch: scrollState.hoveredBranch 
      });
    });
  }, []);
  
  return state;
}
