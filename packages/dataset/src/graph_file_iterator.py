import os

class GraphFileIterator:
    data_dir: str
    files: list[str]
    index: int

    def __init__(self, data_dir: str, extension:str):
        self.data_dir = data_dir
        self.files = [f for f in os.listdir(data_dir) if f.endswith(extension)]
        self.index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.index < len(self.files):
            self.index += 1
            filename = self.files[self.index - 1]
            return filename, os.path.join(self.data_dir, filename)
        else:
            raise StopIteration
        
    def __len__(self):
        return len(self.files)