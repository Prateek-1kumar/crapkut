import { useState } from "react";
import { Database, Eye, EyeOff, Sparkles, FileText, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Download, ChevronDown } from "lucide-react";
import { SimpleExporter, SimpleExportData } from "@/lib/simple-export";

interface GenericResultsProps {
  data: Record<string, unknown>[];
  title?: string;
  dataType?: string;
  userQuery?: string;
}

interface DataInsights {
  dataQuality: string;
  structure: string;
  completeness: string;
  patterns: string;
  recommendations: string[];
  keyFindings: string[]; // Added keyFindings
}

export default function GenericResults({ 
  data, 
  title = "Data", 
  dataType = "items",
  userQuery = ""
}: Readonly<GenericResultsProps>) {
  const [viewMode, setViewMode] = useState<'human' | 'technical'>('human');
  const [showRawData, setShowRawData] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const isHumanMode = viewMode === 'human';
  const isTechnicalMode = viewMode === 'technical';

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Database className="w-5 h-5" />
            {title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">No {dataType} found</p>
        </div>
      </div>
    );
  }

  // Analyze data structure
  const firstItem = data[0];
  const isObject = typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem);
  const isPrimitive = typeof firstItem !== 'object';
  
  // For objects, get all unique keys
  const allKeys = isObject 
    ? Array.from(new Set(data.flatMap(item => Object.keys(item ?? {}))))
    : [];

  // Helper function to calculate completeness score
  const calculateCompletenessScore = (): number => {
    if (!isObject || allKeys.length === 0) {
      return 100; // Primitive data is always "complete"
    }
    
    const filledFields = data.reduce((acc, item) => {
      return acc + allKeys.filter(key => item?.[key] !== undefined && item[key] !== null && item[key] !== '').length;
    }, 0);
    
    return Math.round((filledFields / (data.length * allKeys.length)) * 100);
  };

  // Helper function to analyze value types
  const analyzeValueTypes = (): Set<string> => {
    const valueTypes = new Set<string>();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.values(item).forEach(value => {
          valueTypes.add(typeof value);
        });
      } else {
        valueTypes.add(typeof item);
      }
    });
    return valueTypes;
  };

  // Helper function to determine data quality level
  const getDataQualityLevel = (completenessScore: number): string => {
    if (completenessScore >= 90) {
      return "Excellent - High data completeness and consistency";
    }
    if (completenessScore >= 70) {
      return "Good - Most fields are populated with minor gaps";
    }
    if (completenessScore >= 50) {
      return "Fair - Moderate data completeness, some improvement needed";
    }
    return "Poor - Significant data gaps detected";
  };

  // Helper function to generate data structure description
  const getDataStructureDescription = (): string => {
    const totalItems = data.length;
    const uniqueKeys = allKeys.length;
    
    if (isObject) {
      return `Structured object data with ${uniqueKeys} fields across ${totalItems} records`;
    }
    if (isPrimitive) {
      return `Simple ${typeof firstItem} values with ${totalItems} entries`;
    }
    return `Mixed data types detected across ${totalItems} items`;
  };

  // Helper function to generate recommendations
  const generateRecommendations = (completenessScore: number, valueTypesCount: number): string[] => {
    const recommendations: string[] = [];
    const totalItems = data.length;
    const uniqueKeys = allKeys.length;

    if (completenessScore < 70) {
      recommendations.push("Consider data validation to improve completeness");
    }
    if (isObject && uniqueKeys > 10) {
      recommendations.push("Large number of fields - consider data normalization");
    }
    if (totalItems > 1000) {
      recommendations.push("Large dataset - implement pagination for better performance");
    }
    if (valueTypesCount > 3) {
      recommendations.push("Multiple data types detected - validate data consistency");
    }

    return recommendations;
  };

  // Helper function to generate key findings
  const generateKeyFindings = (completenessScore: number, valueTypesCount: number): string[] => {
    const keyFindings: string[] = [];
    const totalItems = data.length;
    const uniqueKeys = allKeys.length;

    keyFindings.push(`${totalItems} total records processed`);
    if (isObject) {
      keyFindings.push(`${uniqueKeys} unique data fields identified`);
    }
    keyFindings.push(`${completenessScore}% overall data completeness`);
    keyFindings.push(`${valueTypesCount} distinct data types found`);

    return keyFindings;
  };

  // Generate data insights
  const generateDataInsights = (): DataInsights => {
    const completenessScore = calculateCompletenessScore();
    const valueTypes = analyzeValueTypes();
    const uniqueKeys = allKeys.length;

    const dataQuality = getDataQualityLevel(completenessScore);
    const structure = getDataStructureDescription();
    
    let completeness = `${completenessScore}% data completeness`;
    if (isObject) {
      completeness += ` across ${uniqueKeys} fields`;
    }

    const patterns = valueTypes.size === 1 
      ? `Consistent ${Array.from(valueTypes)[0]} data type`
      : `Mixed data types: ${Array.from(valueTypes).join(', ')}`;

    const recommendations = generateRecommendations(completenessScore, valueTypes.size);
    const keyFindings = generateKeyFindings(completenessScore, valueTypes.size);

    return {
      dataQuality,
      structure,
      completeness,
      patterns,
      recommendations,
      keyFindings
    };
  };

  const insights = generateDataInsights();

  const handleExport = async (format: string) => {
    try {
      const exportData: SimpleExportData = {
        // Map existing data types. The actual mapping will depend on how `data` is structured.
        // Assuming `data` is an array of objects and we want to pass it as `genericData`.
        genericData: data, 
        // If you have specific types like products, links, etc., map them here.
        // For example, if `dataType` prop indicates the type:
        // ...(dataType === \'products\' && { products: data as any }),
        // ...(dataType === \'links\' && { links: data as any }),
      };

      switch (format.toLowerCase()) {
        case 'summary':
          SimpleExporter.exportSummary(exportData, userQuery, `generic-${title}-summary.txt`);
          break;
        case 'pdf':
          SimpleExporter.exportToPDF(exportData, userQuery, `generic-${title}-summary.txt`);
          break;
        case 'excel':
          SimpleExporter.exportToExcel(exportData, `generic-${title}-data.csv`);
          break;
        case 'csv':
          SimpleExporter.exportToCSV(exportData, `generic-${title}-data.csv`);
          break;
        case 'word':
          SimpleExporter.exportToWord(exportData, userQuery, `generic-${title}-summary.txt`);
          break;
        case 'json':
          SimpleExporter.exportToJSON(exportData, `generic-${title}-data.json`);
          break;
        default:
          console.warn(`Unsupported export format: ${format}`);
          alert(`Export to ${format} is not supported yet.`);
          return;
      }
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. See console for details.');
    }
  };

  const getQualityScore = () => {
    const regex = /(\d+)%/;
    const match = regex.exec(insights.completeness);
    return match ? parseInt(match[1]) : 0;
  };

  const qualityScore = getQualityScore();

  // Helper function to safely stringify values
  const safeStringify = (value: unknown): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Complex Object]';
      }
    }
    try {
      return JSON.stringify(value);
    } catch {
      return '[Unstringifiable Value]';
    }
  };

  const renderPrimitiveData = () => (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {data.slice(0, 100).map((item, index) => (
        <div
          key={`${safeStringify(item)}-${index}`}
          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
              Item {index + 1}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded">
              {typeof item}
            </span>
          </div>
          <div className="text-sm font-mono break-all">
            {safeStringify(item)}
          </div>
        </div>
      ))}
      {data.length > 100 && (
        <div className="text-center p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing first 100 of {data.length} items
          </p>
        </div>
      )}
    </div>
  );

  const renderObjectData = () => (
    <div className="max-h-96 overflow-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-2 font-medium text-gray-900 dark:text-gray-100">#</th>
              {allKeys.slice(0, 5).map(key => (
                <th key={key} className="text-left p-2 font-medium text-gray-900 dark:text-gray-100 max-w-48">
                  {key}
                </th>
              ))}
              {allKeys.length > 5 && (
                <th className="text-left p-2 font-medium text-gray-900 dark:text-gray-100">
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                    +{allKeys.length - 5} more
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 50).map((item, index) => (
              <tr key={`row-${JSON.stringify(item)}-${index}`} className="border-b border-gray-100 dark:border-gray-800">
                <td className="p-2 font-mono text-xs">
                  {index + 1}
                </td>
                {allKeys.slice(0, 5).map(key => (
                  <td key={`${index}-${key}`} className="p-2 max-w-48">
                    <div className="truncate text-sm">
                      {item?.[key] !== undefined ? (
                        typeof item[key] === 'object' ? (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                            {Array.isArray(item[key]) ? 'Array' : 'Object'}
                          </span>
                        ) : (
                          safeStringify(item[key])
                        )
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>
                ))}
                {allKeys.length > 5 && (
                  <td className="p-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded">
                      {Object.keys(item ?? {}).length} props
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 50 && (
        <div className="text-center p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing first 50 of {data.length} rows
          </p>
        </div>
      )}
    </div>
  );

  // Helper function to render raw JSON data
  const renderRawData = () => (
    <div className="max-h-96 overflow-auto">
      <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  // Helper function to get quality rating
  const getQualityRating = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  // Helper function to get data type display
  const getDataTypeDisplay = (): string => {
    if (isPrimitive) return 'Primitive';
    if (isObject) return 'Object';
    return 'Mixed';
  };

  const dataTypeDisplay = getDataTypeDisplay();

  if (isHumanMode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Data Analysis Insights
            </h3>
            <div className="flex items-center gap-2">
              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-2">
                      {['summary', 'pdf', 'excel', 'csv', 'word', 'json'].map((format) => (
                        <button
                          key={format}
                          onClick={() => handleExport(format)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          Export as {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('human')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isHumanMode
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Insights
                </button>
                <button
                  onClick={() => setViewMode('technical')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isTechnicalMode
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  Technical
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Data Quality</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{qualityScore}%</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {getQualityRating(qualityScore)}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900 dark:text-green-100">Total Records</span>
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{data.length}</div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {dataTypeDisplay} data type
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Data Fields</span>
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {isObject ? allKeys.length : 1}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {isObject ? 'Unique fields' : 'Single field'}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Data Analysis Results
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Data Quality</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.dataQuality}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Database className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Data Structure</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.structure}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Completeness</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.completeness}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Data Patterns</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{insights.patterns}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          {insights.keyFindings.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Key Findings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {insights.keyFindings.map((finding: string) => ( // Typed finding as string
                  <div key={finding} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">{finding}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation) => (
                  <div key={recommendation} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-amber-800 dark:text-amber-200">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Technical mode
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Database className="w-5 h-5" />
            {title} ({data.length} {dataType})
          </h3>
          <div className="flex items-center gap-2">
            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="p-2">
                    {['json'].map((format) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        Export as {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {showRawData ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  Table View
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  Raw Data
                </>
              )}
            </button>
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('human')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isHumanMode
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                Insights
              </button>
              <button
                onClick={() => setViewMode('technical')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isTechnicalMode
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Technical
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
            Type: {dataTypeDisplay}
          </span>
          {isObject && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
              {allKeys.length} unique keys
            </span>
          )}
        </div>
        
        <div>
          {showRawData ? (
            renderRawData()
          ) : (
            <div>
              {isObject ? renderObjectData() : renderPrimitiveData()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
