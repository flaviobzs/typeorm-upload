import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('you do not have enough balance');
    }

    let transaactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transaactionCategory) {
      transaactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transaactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transaactionCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
