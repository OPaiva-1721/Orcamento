import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function makeHost(mockJson: jest.Mock) {
  const mockResponse = { status: jest.fn().mockReturnThis(), json: mockJson };
  return {
    switchToHttp: () => ({ getResponse: () => mockResponse }),
  } as any;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('erro desconhecido → 500 com mensagem genérica, sem stack', () => {
    const json = jest.fn();
    filter.catch(new Error('detalhe interno'), makeHost(json));

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Erro interno',
        code: 'InternalServerError',
      }),
    );
    expect(json.mock.calls[0][0]).not.toHaveProperty('stack');
  });

  it('HttpException → passa status e mensagem original', () => {
    const json = jest.fn();
    filter.catch(
      new HttpException('Not Found', HttpStatus.NOT_FOUND),
      makeHost(json),
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: 'Not Found' }),
    );
  });

  it('em development inclui stack no response', () => {
    process.env.NODE_ENV = 'development';
    const json = jest.fn();
    const err = new Error('boom');
    filter.catch(err, makeHost(json));

    expect(json.mock.calls[0][0]).toHaveProperty('stack');
  });
});
