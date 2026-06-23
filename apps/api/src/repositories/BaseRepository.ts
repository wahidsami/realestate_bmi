export abstract class BaseRepository<T> {
  constructor(protected readonly modelName: string) {}
}
