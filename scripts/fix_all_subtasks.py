import json

def fix_all_subtasks():
    """Sort ALL task subtasks by ID to fix numbering issues."""
    print("Reading tasks.json...")
    with open('.taskmaster/tasks/tasks.json', 'r') as f:
        data = json.load(f)
    
    tasks = data['tdd']['tasks']
    fixed_count = 0
    
    for task in tasks:
        tid = task.get('id')
        subs = task.get('subtasks', [])
        if not subs:
            continue
        
        # Check if out of order
        ids = [s.get('id', 0) for s in subs]
        if ids != sorted(ids):
            # Sort by ID
            subs.sort(key=lambda x: x.get('id', 0))
            task['subtasks'] = subs
            print(f"  Fixed Task {tid}: Sorted {len(subs)} subtasks")
            fixed_count += 1
    
    with open('.taskmaster/tasks/tasks.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Done. Fixed {fixed_count} tasks.")

if __name__ == "__main__":
    fix_all_subtasks()
