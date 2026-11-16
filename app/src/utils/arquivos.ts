import { File } from 'expo-file-system';

/** Apaga um arquivo local sem lançar erro se ele já não existir. */
export async function apagarArquivo(uri: string | null): Promise<void> {
  if (!uri) return;
  try {
    const arquivo = new File(uri);
    if (arquivo.exists) arquivo.delete();
  } catch (e) {
    console.warn('Não foi possível apagar o arquivo:', uri, e);
  }
}