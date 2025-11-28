import { runConcurrentReads, showErrorMessage, showSuccessMessage } from './app.js';
import { apiClient } from './api.js';

// Minimal Test Cases module (we will add Case2/Case3 later)
export async function case1ConcurrentReads(nodeA, nodeB, recordId, isolationLevel) {
  try {
    const { ra, rb, query } = await runConcurrentReads(nodeA, nodeB, recordId, isolationLevel);
    const okA = ra.status === 'fulfilled' ? 'OK' : 'FAIL';
    const okB = rb.status === 'fulfilled' ? 'OK' : 'FAIL';
    const dataA = ra.status === 'fulfilled' ? (ra.value.data.results || []) : [];
    const dataB = rb.status === 'fulfilled' ? (rb.value.data.results || []) : [];
    const rowsA = dataA.length;
    const rowsB = dataB.length;
    const same = ra.status === 'fulfilled' && rb.status === 'fulfilled'
      ? JSON.stringify(dataA) === JSON.stringify(dataB)
      : false;
    return {
      nodeA, nodeB, recordId, query,
      results: {
        nodeA: okA,
        nodeB: okB,
        rowsA,
        rowsB,
        same,
        dataA,
        dataB
      }
    };
  } catch (e) {
    showErrorMessage(e.message);
    return { error: e.message };
  }
}

// Case 2: one write then concurrent reads from writer + 2 readers
export async function case2WritePlusReads(writerNode, readerA, readerB, recordId, newValue, isolationLevel) {
  const id = Number(recordId);
  const val = Number(newValue);
  const iso = isolationLevel || 'READ_COMMITTED';
  const updateQuery = `UPDATE trans SET amount = ${val} WHERE trans_id = ${id}`;
  const selectQuery = `SELECT * FROM trans WHERE trans_id = ${id}`;
  let writeResult;
  try {
    writeResult = await apiClient.post('/query/execute', { node: writerNode, query: updateQuery, isolationLevel: iso });
  } catch (e) {
    writeResult = { status: 'failed', error: e.message };
  }
  // Concurrent reads
  const readPromises = [
    apiClient.post('/query/execute', { node: writerNode, query: selectQuery, isolationLevel: iso }),
    apiClient.post('/query/execute', { node: readerA, query: selectQuery, isolationLevel: iso }),
    apiClient.post('/query/execute', { node: readerB, query: selectQuery, isolationLevel: iso })
  ];
  const [wRead, aRead, bRead] = await Promise.allSettled(readPromises);
  const unwrap = r => r.status === 'fulfilled' ? (r.value.data.results || []) : [];
  const replication = writeResult?.data?.replication || [];

  return {
    isolation: iso,
    write: {
      status: writeResult?.data?.logEntry?.status || writeResult.status || 'unknown',
      error: writeResult.error,
      query: updateQuery,
      replication
    },
    reads: {
      writer: unwrap(wRead),
      readerA: unwrap(aRead),
      readerB: unwrap(bRead)
    }
  };
}

export async function retryReplication() {
  // placeholder for future phases
  showSuccessMessage('Retry triggered (to be implemented)');
}
